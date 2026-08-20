import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("admin1234", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash,
      name: "Administrator",
      role: "admin",
    },
  });

  const hq = await prisma.location.upsert({
    where: { name: "สำนักงานใหญ่" },
    update: {},
    create: { code: "HQ", name: "สำนักงานใหญ่", note: "Main office" },
  });

  const branch = await prisma.location.upsert({
    where: { name: "สาขา 1" },
    update: {},
    create: { code: "BR1", name: "สาขา 1" },
  });

  const employee = await prisma.employee.upsert({
    where: { empCode: "EMP001" },
    update: {},
    create: {
      empCode: "EMP001",
      title: "นาย",
      firstName: "สมชาย",
      lastName: "ใจดี",
      department: "IT",
      branch: "HQ",
      email: "somchai@example.com",
    },
  });

  const asset = await prisma.asset.upsert({
    where: { serialNo: "SN-DEMO-001" },
    update: {},
    create: {
      type: "Laptop",
      status: "Active",
      brand: "Dell",
      model: "Latitude 5540",
      serialNo: "SN-DEMO-001",
      mac: "AA:BB:CC:DD:EE:01",
      os: "Windows 11",
      msOffice: "Microsoft 365",
      assignedToId: employee.id,
      locationId: hq.id,
      assetLocation: "ชั้น 3",
      acquisitionDate: new Date("2024-01-15"),
    },
  });

  await prisma.assetEvent.deleteMany({ where: { assetId: asset.id } });
  await prisma.assetEvent.create({
    data: {
      assetId: asset.id,
      eventType: "CREATE",
      fieldName: "snapshot",
      newValue: JSON.stringify({
        type: asset.type,
        status: asset.status,
        serialNo: asset.serialNo,
      }),
      actorId: admin.id,
    },
  });

  console.log("Seed complete:");
  console.log("- admin / admin1234");
  console.log(`- demo asset ${asset.serialNo}`);
  console.log(`- locations: ${hq.name}, ${branch.name}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
