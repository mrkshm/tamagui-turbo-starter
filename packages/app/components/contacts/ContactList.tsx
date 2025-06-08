// Fallback that will never run if platform files exist
export const ContactList: React.FC<any> = () => {
  throw new Error('ContactList implementation not found for this platform');
};
