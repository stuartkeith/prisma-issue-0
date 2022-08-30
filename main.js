const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // clean up previous runs
  await prisma.owner.deleteMany({});
  await prisma.pet.deleteMany({});

  await prisma.pet.create({
    data: {
      // use NO-BREAK-SPACE
      // https://www.fileformat.info/info/unicode/char/00a0/index.htm
      id: "dog" + String.fromCharCode(parseInt('00A0', 16)) + "example"
    }
  });

  // can successully refer to the key without any space
  await prisma.owner.create({
    data: {
      petId: "dog example"
    }
  });

  // can join using the key without any space
  const rawResult = await prisma.$queryRaw`SELECT o.petId as ownerPetId, p.id as petId FROM Owner o INNER JOIN Pet p ON o.petId = p.id`;
  const { ownerPetId, petId } = rawResult[0];

  console.log("raw sql result:", ownerPetId, petId, ownerPetId === petId);

  // but this will throw
  // "Inconsistent query result: Field pet is required to return data, got `null` instead"
  const result = await prisma.owner.findFirst({
    where: {
      petId: "dog example"
    },
    select: {
      id: true,
      pet: {
        select: {
          id: true
        }
      }
    }
  })

  console.log(result);
}

main();
