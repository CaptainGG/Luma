import { PrismaClient, RoomType } from "@prisma/client";
import { subDays, subMinutes } from "date-fns";

import {
  DEMO_SPACE_NAME,
  DEMO_USER_EMAIL,
  DEMO_USER_NAME,
  ROOM_TYPE_CONFIG,
} from "../src/lib/constants";
import { findStructuredInsights, presentInsight } from "../src/lib/scoring";
import { generateSeedReading, evaluateReadingAlerts } from "../src/lib/simulation";

const prisma = new PrismaClient();

async function main() {
  await prisma.alert.deleteMany();
  await prisma.insight.deleteMany();
  await prisma.sensorReading.deleteMany();
  await prisma.device.deleteMany();
  await prisma.room.deleteMany();
  await prisma.space.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: DEMO_USER_EMAIL,
      name: DEMO_USER_NAME,
      preference: {
        create: {
          summaryCadence: "DAILY",
          morningDigest: true,
          anomalyHighlights: true,
          comfortTargets: true,
          calmMode: true,
        },
      },
    },
    include: { preference: true },
  });

  const space = await prisma.space.create({
    data: {
      name: DEMO_SPACE_NAME,
      userId: user.id,
    },
  });

  const roomTypes: RoomType[] = [
    "BEDROOM",
    "WORKSPACE",
    "LIVING_ROOM",
    "SHARED_ROOM",
  ];

  for (const roomType of roomTypes) {
    const config = ROOM_TYPE_CONFIG[roomType];

    const room = await prisma.room.create({
      data: {
        spaceId: space.id,
        name: config.defaultName,
        type: roomType,
        temperatureMin: config.thresholds.temperature[0],
        temperatureMax: config.thresholds.temperature[1],
        humidityMin: config.thresholds.humidity[0],
        humidityMax: config.thresholds.humidity[1],
        co2Max: config.thresholds.co2Max,
        lightTarget: config.thresholds.lightTarget,
        noiseMax: config.thresholds.noiseMax,
      },
    });

    const device = await prisma.device.create({
      data: {
        roomId: room.id,
        name: `${config.defaultName} Monitor`,
        batteryLevel: 92,
        connectionState: "ONLINE",
        firmwareVersion: "1.4.2",
        lastSyncAt: subMinutes(new Date(), 6),
      },
    });

    const readings = [];
    const end = new Date();
    const start = subDays(end, 7);
    let cursor = start;
    let previous = null;

    while (cursor <= end) {
      const reading = generateSeedReading({
        roomId: room.id,
        roomType,
        timestamp: cursor,
        previous,
      });

      readings.push({
        roomId: room.id,
        deviceId: device.id,
        timestamp: cursor,
        temperature: reading.temperature,
        humidity: reading.humidity,
        co2: reading.co2,
        light: reading.light,
        noise: reading.noise,
        occupancy: reading.occupancy,
        isAnomaly: reading.isAnomaly,
        anomalyLabel: reading.anomalyLabel,
      });

      previous = reading;
      cursor = subMinutes(cursor, -30);
    }

    await prisma.sensorReading.createMany({ data: readings });

    const latest = readings.at(-1);

    if (!latest) {
      continue;
    }

    const alerts = evaluateReadingAlerts({
      reading: latest,
      thresholds: config.thresholds,
    });

    for (const alert of alerts) {
      await prisma.alert.create({
        data: {
          roomId: room.id,
          deviceId: device.id,
          severity: alert.severity,
          status: "ACTIVE",
          title: alert.title,
          description: alert.description,
          metricKey: alert.metricKey,
          threshold: alert.threshold,
          triggeredAt: latest.timestamp,
        },
      });
    }

    const recentReadings = await prisma.sensorReading.findMany({
      where: { roomId: room.id },
      orderBy: { timestamp: "desc" },
      take: 96,
    });

    const findings = findStructuredInsights({
      roomId: room.id,
      roomName: room.name,
      roomType: room.type,
      readings: recentReadings.reverse(),
      thresholds: config.thresholds,
    });

    for (const finding of findings.slice(0, 2)) {
      await prisma.insight.create({
        data: {
          roomId: room.id,
          type: finding.type,
          findingKey: finding.findingKey,
          evidence: finding.evidence,
          displayText: presentInsight(finding),
          source: "RULES",
          windowStart: finding.windowStart,
          windowEnd: finding.windowEnd,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });


