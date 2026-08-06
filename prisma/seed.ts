import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = process.env.SEED_PASSWORD ?? "onsective123";

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await prisma.ticketMessage.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.task.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.project.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.client.deleteMany();

  const founder = await prisma.user.create({
    data: {
      name: "Aarav Mehta",
      email: "admin@onsective.com",
      passwordHash,
      role: "ADMIN",
      employee: {
        create: { jobTitle: "Founder & CEO", department: "OPERATIONS", hireDate: new Date("2021-04-01") },
      },
    },
    include: { employee: true },
  });
  const ceo = founder.employee!;

  const seoLead = (
    await prisma.user.create({
      data: {
        name: "Priya Nair",
        email: "priya@onsective.com",
        passwordHash,
        role: "MANAGER",
        employee: {
          create: {
            jobTitle: "Head of SEO",
            department: "SEO",
            managerId: ceo.id,
            salary: 82000,
            hireDate: new Date("2022-02-14"),
          },
        },
      },
      include: { employee: true },
    })
  ).employee!;

  const socialLead = (
    await prisma.user.create({
      data: {
        name: "Diego Alvarez",
        email: "diego@onsective.com",
        passwordHash,
        role: "EMPLOYEE",
        employee: {
          create: {
            jobTitle: "Social Media Manager",
            department: "SOCIAL_MEDIA",
            managerId: ceo.id,
            salary: 64000,
            hireDate: new Date("2023-06-05"),
          },
        },
      },
      include: { employee: true },
    })
  ).employee!;

  const adsSpecialist = (
    await prisma.user.create({
      data: {
        name: "Hana Suzuki",
        email: "hana@onsective.com",
        passwordHash,
        role: "EMPLOYEE",
        employee: {
          create: {
            jobTitle: "Performance Marketing Specialist",
            department: "DIGITAL_MARKETING",
            managerId: seoLead.id,
            salary: 71000,
            hireDate: new Date("2024-01-08"),
          },
        },
      },
      include: { employee: true },
    })
  ).employee!;

  const northPeak = await prisma.client.create({
    data: {
      company: "NorthPeak Outdoors",
      contactName: "Sarah Collins",
      email: "sarah@northpeak.com",
      phone: "+1 604 555 0119",
      website: "https://northpeak.com",
      industry: "E-commerce / Outdoor gear",
      status: "ACTIVE",
      ownerId: seoLead.id,
    },
  });

  const lumaClinic = await prisma.client.create({
    data: {
      company: "Luma Dental Clinic",
      contactName: "Dr. Owen Reid",
      email: "owen@lumadental.ca",
      phone: "+1 403 555 0142",
      industry: "Healthcare",
      status: "ACTIVE",
      ownerId: socialLead.id,
    },
  });

  const brightHaus = await prisma.client.create({
    data: {
      company: "BrightHaus Interiors",
      contactName: "Mia Fontaine",
      email: "mia@brighthaus.co",
      industry: "Interior design",
      status: "PROSPECT",
      ownerId: ceo.id,
    },
  });

  await prisma.user.create({
    data: {
      name: "Sarah Collins",
      email: "client@northpeak.com",
      passwordHash,
      role: "CLIENT",
      clientId: northPeak.id,
    },
  });

  await prisma.deal.createMany({
    data: [
      {
        title: "SEO retainer expansion",
        clientId: northPeak.id,
        contactName: "Sarah Collins",
        contactEmail: "sarah@northpeak.com",
        service: "SEO",
        stage: "NEGOTIATION",
        value: 48000,
        probability: 70,
        source: "Existing client",
        ownerId: seoLead.id,
        expectedCloseDate: daysFromNow(21),
      },
      {
        title: "Instagram + TikTok management",
        clientId: brightHaus.id,
        contactName: "Mia Fontaine",
        service: "SOCIAL_MEDIA_MANAGEMENT",
        stage: "PROPOSAL",
        value: 18000,
        probability: 45,
        source: "Referral",
        ownerId: socialLead.id,
        expectedCloseDate: daysFromNow(30),
      },
      {
        title: "Google Ads launch — Q3",
        contactName: "Tom Byrne",
        contactEmail: "tom@ridgeline.io",
        service: "DIGITAL_MARKETING",
        stage: "QUALIFIED",
        value: 26000,
        probability: 30,
        source: "LinkedIn outbound",
        ownerId: adsSpecialist.id,
      },
      {
        title: "Website rebuild",
        clientId: lumaClinic.id,
        contactName: "Dr. Owen Reid",
        service: "WEB_DEVELOPMENT",
        stage: "WON",
        value: 32000,
        probability: 100,
        source: "Inbound",
        ownerId: ceo.id,
      },
    ],
  });

  const seoProject = await prisma.project.create({
    data: {
      name: "NorthPeak organic growth",
      description: "Technical SEO, content clusters and digital PR.",
      clientId: northPeak.id,
      service: "SEO",
      status: "IN_PROGRESS",
      budget: 48000,
      managerId: seoLead.id,
      dueDate: daysFromNow(75),
    },
  });

  const socialProject = await prisma.project.create({
    data: {
      name: "Luma Dental social engine",
      description: "Monthly content calendar and community management.",
      clientId: lumaClinic.id,
      service: "SOCIAL_MEDIA_MANAGEMENT",
      status: "IN_PROGRESS",
      budget: 21000,
      managerId: socialLead.id,
      dueDate: daysFromNow(45),
    },
  });

  await prisma.task.createMany({
    data: [
      {
        projectId: seoProject.id,
        title: "Technical SEO audit",
        description: "Crawl, index coverage and Core Web Vitals review.",
        status: "DONE",
        priority: "HIGH",
        assigneeId: seoLead.id,
        dueDate: daysFromNow(-10),
        estimateHours: 12,
      },
      {
        projectId: seoProject.id,
        title: "Keyword cluster map — 40 pages",
        status: "IN_PROGRESS",
        priority: "HIGH",
        assigneeId: seoLead.id,
        dueDate: daysFromNow(6),
        estimateHours: 20,
      },
      {
        projectId: seoProject.id,
        title: "Link building outreach — batch 1",
        status: "TODO",
        priority: "MEDIUM",
        assigneeId: adsSpecialist.id,
        dueDate: daysFromNow(18),
        estimateHours: 16,
      },
      {
        projectId: seoProject.id,
        title: "Internal: margin review",
        status: "TODO",
        priority: "LOW",
        assigneeId: seoLead.id,
        clientVisible: false,
      },
      {
        projectId: socialProject.id,
        title: "August content calendar",
        status: "REVIEW",
        priority: "HIGH",
        assigneeId: socialLead.id,
        dueDate: daysFromNow(3),
        estimateHours: 10,
      },
      {
        projectId: socialProject.id,
        title: "Reels production — 8 videos",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        assigneeId: socialLead.id,
        dueDate: daysFromNow(12),
        estimateHours: 24,
      },
    ],
  });

  const auditTask = await prisma.task.findFirstOrThrow({ where: { title: "Technical SEO audit" } });
  await prisma.timeEntry.createMany({
    data: [
      { taskId: auditTask.id, employeeId: seoLead.id, hours: 6.5, note: "Crawl + log file analysis" },
      { taskId: auditTask.id, employeeId: seoLead.id, hours: 4, note: "Report writing" },
    ],
  });

  await prisma.invoice.createMany({
    data: [
      {
        number: "ONS-2026-0001",
        clientId: northPeak.id,
        projectId: seoProject.id,
        amount: 8000,
        status: "PAID",
        dueDate: daysFromNow(-20),
      },
      {
        number: "ONS-2026-0002",
        clientId: northPeak.id,
        projectId: seoProject.id,
        amount: 8000,
        status: "SENT",
        dueDate: daysFromNow(9),
      },
      {
        number: "ONS-2026-0003",
        clientId: lumaClinic.id,
        projectId: socialProject.id,
        amount: 3500,
        status: "OVERDUE",
        dueDate: daysFromNow(-6),
      },
    ],
  });

  const ticket = await prisma.ticket.create({
    data: {
      subject: "Can we prioritise the product category pages?",
      clientId: northPeak.id,
      priority: "HIGH",
      status: "IN_PROGRESS",
      assigneeId: seoLead.id,
      messages: {
        create: [
          {
            body: "Our winter category is underperforming — can we bring that forward in the roadmap?",
            authorName: "Sarah Collins",
            fromClient: true,
          },
          {
            body: "Absolutely. We'll reshuffle the keyword cluster work to cover winter categories first this sprint.",
            authorName: "Priya Nair",
            authorId: seoLead.id,
          },
        ],
      },
    },
  });

  await prisma.activity.createMany({
    data: [
      {
        type: "CALL",
        body: "Quarterly review call — agreed to expand retainer scope to digital PR.",
        clientId: northPeak.id,
        authorId: seoLead.id,
      },
      {
        type: "EMAIL",
        body: "Sent social media proposal deck to Mia.",
        clientId: brightHaus.id,
        authorId: socialLead.id,
      },
    ],
  });

  await prisma.leaveRequest.createMany({
    data: [
      {
        employeeId: socialLead.id,
        type: "PAID",
        status: "PENDING",
        startDate: daysFromNow(20),
        endDate: daysFromNow(27),
        reason: "Family holiday",
      },
      {
        employeeId: adsSpecialist.id,
        type: "SICK",
        status: "APPROVED",
        startDate: daysFromNow(-9),
        endDate: daysFromNow(-8),
        reason: "Flu",
        reviewerId: ceo.id,
      },
    ],
  });

  console.log(`Seeded demo data. Ticket ${ticket.id}. Password for all accounts: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
