import { forwardRef, ButtonHTMLAttributes } from 'react';
import { classNames } from '../../utils/classNames';
import './Avatar.scss';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  name: string;
  picture?: string;
  size?: AvatarSize;
}

const Avatar = forwardRef<HTMLButtonElement, AvatarProps>(({ name, picture, size = 'md', className, ...props }, ref) => {
  const getInitials = (fullName: string): string => {
    if (!fullName) return '?';
    const names = fullName.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getColorFromName = (fullName: string): string => {
    if (!fullName) return 'hsl(200, 40%, 50%)';
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 50%, 50%)`;
  };

  const initials = getInitials(name);
  const backgroundColor = getColorFromName(name);

  return (
    <button
      ref={ref}
      type='button'
      className={classNames('avatar', `avatar--${size}`, className)}
      style={!picture ? { backgroundColor } : undefined}
      {...props}
    >
      {picture ? <img src={picture} alt={name} className='avatar__image' /> : <span className='avatar__initials'>{initials}</span>}
    </button>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;
