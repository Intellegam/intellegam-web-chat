import { motion } from 'framer-motion';
import { Markdown } from './markdown';

export const Overview = ({ startMessage }: { startMessage: string }) => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
    <Markdown>{startMessage}</Markdown>
    </motion.div>
  );
};
