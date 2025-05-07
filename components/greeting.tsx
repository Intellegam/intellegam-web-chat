import { motion } from 'framer-motion';
import Markdown from 'react-markdown';

export const Greeting = ({ startMessage }: { startMessage: string }) => {
  return (
    <div
      key="overview"
      className="flex flex-col justify-center mx-auto md:mt-20 px-8 max-w-3xl size-full"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="font-semibold text-2xl"
      >
        {/* Hello there! */}
        <Markdown>{startMessage}</Markdown>
      </motion.div>
      {/* <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-zinc-500 text-2xl"
      >
        How can I help you today?
      </motion.div> */}
    </div>
  );
};
