import { useEffect } from 'react';
import { motion } from 'framer-motion';

import SectionHeading from '../../components/common/SectionHeading';
import StickerBadge from '../../components/common/StickerBadge';
import Accordion from '../../components/common/Accordion';
import Button from '../../components/common/Button';
import { OrangeDots } from '../../components/common/Decorations';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const termsSections = [
  {
    question: 'Acceptance of Terms',
    answer:
      'By accessing and using the Growme Tech website and services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our website or services. We reserve the right to modify these terms at any time, and your continued use of our services constitutes acceptance of any changes.',
  },
  {
    question: 'Services Description',
    answer:
      'Growme Tech provides digital services including web development, mobile app development, UI/UX design, custom software development, e-commerce solutions, AI & automation, cloud solutions, and digital transformation consulting. The specific scope, deliverables, timeline, and pricing for each project are defined in individual project agreements or statements of work (SOW) signed by both parties. We reserve the right to modify, suspend, or discontinue any part of our services at any time.',
  },
  {
    question: 'Intellectual Property',
    answer:
      'Upon full payment, clients receive ownership of the custom code, designs, and deliverables created specifically for their project, unless otherwise stated in the project agreement. Growme Tech retains ownership of all pre-existing tools, frameworks, libraries, and proprietary methodologies used in the development process. We reserve the right to reuse general knowledge, techniques, and non-client-specific components in future projects. The Growme Tech brand, logo, and website content remain our exclusive intellectual property.',
  },
  {
    question: 'Limitation of Liability',
    answer:
      'Growme Tech shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising out of or in connection with the use of our services. Our total liability for any claim arising from our services shall not exceed the total amount paid by the client for the specific project in question. We are not responsible for any third-party services, APIs, or platforms integrated into client projects.',
  },
  {
    question: 'Payment Terms',
    answer:
      'Payment terms are defined in individual project agreements. Typically, projects require a deposit before work begins, with remaining payments tied to project milestones. All invoices are due within 15 days of issuance unless otherwise agreed upon in writing. Late payments may incur a fee of 2% per month on the outstanding balance. We reserve the right to pause or halt work on any project with overdue payments. All prices are exclusive of applicable taxes unless explicitly stated otherwise.',
  },
  {
    question: 'Termination',
    answer:
      'Either party may terminate a project engagement with 30 days written notice. In the event of termination, the client is responsible for payment of all work completed up to the termination date. Any materials, code, or deliverables completed and paid for will be transferred to the client. Growme Tech reserves the right to terminate services immediately if the client breaches any terms of the agreement, engages in illegal activities, or fails to make timely payments.',
  },
  {
    question: 'Governing Law',
    answer:
      'These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes arising from these terms or our services shall be subject to the exclusive jurisdiction of the courts located in Indore, Madhya Pradesh, India. Both parties agree to attempt to resolve any disputes through good-faith negotiation before pursuing formal legal proceedings.',
  },
];

export default function TermsPage() {
  useEffect(() => {
    document.title = 'Terms & Conditions — Growme Tech';
  }, []);

  return (
    <main className="bg-cream min-h-screen">
      {/* ── Hero ── */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <StickerBadge text="LEGAL" color="orange" rotate={-2} />
            </motion.div>
            <motion.div variants={fadeUp} custom={1}>
              <SectionHeading as="h1" size="xl">
                Terms &amp; Conditions.
              </SectionHeading>
            </motion.div>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-4 text-medium-gray text-base"
            >
            </motion.p>
            <motion.p
              variants={fadeUp}
              custom={3}
              className="mt-4 text-medium-gray text-base leading-relaxed max-w-2xl"
            >
              Please read these terms and conditions carefully before using the Growme Tech website
              and services.
            </motion.p>
          </motion.div>

          <OrangeDots className="absolute top-36 right-12 hidden lg:flex" count={4} size="lg" />
        </div>
      </section>

      {/* ── Terms Sections ── */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Accordion items={termsSections} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 text-xs font-mono text-medium-gray"
          >
            Growme Tech client agreements are governed under master services agreements (MSA) and statement of work (SOW) documents executed per project.
          </motion.p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-medium-gray mb-6">
              Have questions about our terms?
            </p>
            <Button to="/contact" variant="secondary" size="md" arrow>
              Contact Us
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
