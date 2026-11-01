import { useEffect, useRef, useState } from 'react';
import { useCart } from '../../store/cart';

export default function AddToCart({ id, name, label = 'Add to cart', className = '' }) {
  const add = useCart((s) => s.add);
  const [done, setDone] = useState(false);
  const t = useRef();
  useEffect(() => () => clearTimeout(t.current), []);
  const onClick = () => { add(id); setDone(true); clearTimeout(t.current); t.current = setTimeout(() => setDone(false), 1600); };
  return (
    <>
      <button type="button" onClick={onClick} aria-label={`${label}: ${name}`} className={`btn ${className}`}><span>{done ? 'Added ✓' : label}</span></button>
      <span className="sr-only" role="status">{done ? `${name} added to cart` : ''}</span>
    </>
  );
}
