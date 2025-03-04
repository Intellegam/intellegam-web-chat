import { Globe } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function WebToggleButton() {
  const [isActive, setActive] = useState(false);

  function handleButtonClick() {
    setActive(!isActive);
  }

  return (
    <Button
      className={`p-[7px] h-fit rounded-md ${isActive ? 'bg-blue-600/40' : ''} dark:border-zinc-700 hover:dark:bg-zinc-900 hover:bg-zinc-200`}
      onClick={(event) => {
        event.preventDefault();
        handleButtonClick();
      }}
      variant="ghost"
    >
      <Globe
        className={`transition-color ${isActive ? 'text-blue-400' : ''}`}
      />
      {isActive && (
        <motion.span
          className="flex items-center h-4 text-blue-600 dark:text-blue-400"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0, transition: { delay: 0.4 } }}
        >
          Web
        </motion.span>
      )}
    </Button>
  );
}
