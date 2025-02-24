import Image from 'next/image';

export default function AssistantAvatar({ chatLogo }: { chatLogo?: string }) {
  //TODO: Logo should change based on theme
  const avatarImage = chatLogo || '/images/intellegam_logo_light.svg';
  return (
    <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
      <Image
        className="size-6"
        width={10}
        height={10}
        src={avatarImage}
        alt="chat logo"
      />
    </div>
  );
}
