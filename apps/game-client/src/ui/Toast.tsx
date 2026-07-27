import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  message: string | null;
}

export function Toast({ message }: Props) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          className="toast"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
