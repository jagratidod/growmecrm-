import { useEffect } from 'react';
import { motion } from 'framer-motion';

import SectionLabel from '../../components/common/SectionLabel';
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

const privacySections = [
  {
    question: 'Information We Collect',
    answer:
      'We collect information you provide directly to us, such as your name, email address, phone number, and project details when you fill out our contact or quote forms. We also automatically collect certain information when you visit our website, including your IP address, browser type, operating system, referring URLs, and information about how you interact with our website through cookies and similar technologies.',
  },
  {
    question: 'How We Use Information',
    answer:
      'We use the information we collect to provide, maintain, and improve our services; respond to your inquiries and fulfill your requests; send you technical notices, updates, and administrative messages; communicate with you about products, services, and events offered by Growme Tech; monitor and analyze trends, usage, and activities in connection with our services; and detect, investigate, and prevent fraudulent transactions and other illegal activities.',
  },
  {
    question: 'Data Security',
    answer:
      'We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. We implement appropriate technical and organizational measures, including encryption of data in transit and at rest, access controls, and regular security assessments. However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.',
  },
  {
    question: 'Your Rights',
    answer:
      'Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete your data; the right to object to or restrict processing of your data; the right to data portability; and the right to withdraw consent at any time. To exercise any of these rights, use the GrowMe Contact page.',
  },
  {
    question: 'Cookies',
    answer:
      'We use cookies and similar tracking technologies to collect and track information about your browsing activity on our website. Cookies are small data files stored on your device that help us improve our website and your experience. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, some features of our website may not function properly. We use essential cookies for site functionality, analytics cookies to understand how visitors use our site, and preference cookies to remember your settings.',
  },
  {
    question: 'Contact Us',
    answer:
      'If you have any questions about this Privacy Policy or our data practices, use the GrowMe Contact page.',
  },
];

export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy — Growme Tech';
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
                Privacy Policy.
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
              At Growme Tech, we are committed to protecting your privacy. This policy outlines how
              we collect, use, and safeguard your personal information when you interact with our
              website and services.
            </motion.p>
          </motion.div>

          <OrangeDots className="absolute top-36 right-12 hidden lg:flex" count={4} size="lg" />
        </div>
      </section>

      {/* ── Policy Sections ── */}
      <section className="pb-20 md:pb-28">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Accordion items={privacySections} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 text-xs font-mono text-medium-gray"
          >
            Growme Tech is committed to industry-standard data hygiene, GDPR compliance principles, and strict non-disclosure governance.
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
              Have questions about our privacy practices?
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
