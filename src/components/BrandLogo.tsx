import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href: string;
};

export function BrandLogo({ href }: BrandLogoProps) {
  return (
    <Link className="brand brand-logo" href={href}>
      <Image alt="SKhool by Drozdov K." height={68} priority src="/skhool-logo-clean.png" width={180} />
    </Link>
  );
}
