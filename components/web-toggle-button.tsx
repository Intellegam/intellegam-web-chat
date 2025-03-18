import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { Button } from './ui/button';

export default function WebToggleButton({
  setSearchWeb,
}: { setSearchWeb: Dispatch<SetStateAction<boolean>> }) {
  const [isActive, setActive] = useState(false);

  function handleButtonClick() {
    const newValue = !isActive;
    setActive(newValue);
    setSearchWeb(newValue);
  }

  return (
    <Button
      className={`p-[7px] h-fit rounded-md ${isActive ? 'bg-blue-400/40 dark:bg-blue-600/40 hover:bg-blue-300/40 hover:dark:bg-blue-700/40' : 'hover:dark:bg-zinc-900 hover:bg-zinc-300'} dark:border-zinc-700`}
      onClick={(event) => {
        event.preventDefault();
        handleButtonClick();
      }}
      variant="ghost"
    >
      <Globe
        className={`transition-color ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`}
      />
      {isActive && (
        <motion.span
          className="flex items-center h-4 text-blue-600 dark:text-blue-400"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          Web
        </motion.span>
      )}
    </Button>
  );
}
