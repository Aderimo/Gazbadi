import { getNewlyAdded } from '@/lib/data';
import NewlyAddedClient from './NewlyAddedClient';

const MAX_ITEMS = 6;

export default function NewlyAdded() {
  const items = getNewlyAdded(MAX_ITEMS);

  return <NewlyAddedClient items={items} />;
}
