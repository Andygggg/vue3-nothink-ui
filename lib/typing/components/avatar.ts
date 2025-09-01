export type AvatarSize = 'small' | 'medium' | 'large' | number
export type AvatarShape = 'circle' | 'square'

export interface AvatarProps {
  src?: string
  name: string
  size?: AvatarSize
  shape?: AvatarShape
  backgroundColor?: string
  textColor?: string
}
