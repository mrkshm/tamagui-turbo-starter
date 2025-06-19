import React from 'react';
import { AvatarUploader, AvatarUploaderProps } from './AvatarUploader';

export interface ContactAvatarUploaderProps
  extends Omit<AvatarUploaderProps, 'entityType' | 'entityId'> {
  /**
   * The contact's unique id that the backend expects for avatar upload / delete.
   */
  contactSlug: string;
}

/**
 * Thin wrapper around the generic `AvatarUploader` configured for contacts.
 * It delegates all UI/logic to the shared component but pins the entityType to
 * `'contact'` and wires the required `entityId`.
 */
export const ContactAvatarUploader: React.FC<ContactAvatarUploaderProps> = ({
  contactSlug,
  ...rest
}) => {
  return (
    <AvatarUploader {...rest} entityType="contact" entityId={contactSlug} />
  );
};
