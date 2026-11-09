import { OptionList } from '@lobehub/cli-ui';
import { useEffect, useState } from 'react';

const items = [
  { hint: 'GPT models', label: 'openai', value: 'openai' },
  { label: 'anthropic', value: 'anthropic' },
  { label: 'google', value: 'google' },
];

export default function BasicDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % items.length);
    }, 500);
    return () => clearInterval(id);
  }, []);
  return <OptionList activeIndex={activeIndex} items={items} limit={10} />;
}
