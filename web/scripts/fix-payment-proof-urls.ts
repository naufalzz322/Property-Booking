import { prisma } from "../src/lib/prisma";

async function fixPaymentProofUrls() {
  // Restore double path since that's where the file actually is in Supabase
  const invoices = await prisma.invoice.findMany({
    where: {
      paymentProofUrl: {
        not: null,
      },
    },
  });

  console.log(`Found ${invoices.length} invoices`);

  for (const invoice of invoices) {
    if (invoice.paymentProofUrl && !invoice.paymentProofUrl.includes("/payment-proofs/payment-proofs/")) {
      // Add the double path to match where file actually is
      const fixedUrl = invoice.paymentProofUrl.replace(
        "/payment-proofs/",
        "/payment-proofs/payment-proofs/"
      );

      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { paymentProofUrl: fixedUrl },
      });

      console.log(`Fixed: ${invoice.id}`);
      console.log(`  ${fixedUrl}`);
    } else {
      console.log(`Already correct: ${invoice.id}`);
    }
  }

  console.log("Done!");
}

fixPaymentProofUrls()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
