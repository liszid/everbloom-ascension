import elderArt from "@/assets/art/elder_rowan.webp";

export function ElderSprite() {
  return <img className="elder-art" src={elderArt} alt="Elder Rowan, an elderly white-bearded village guide" width={256} height={256} draggable={false} />;
}