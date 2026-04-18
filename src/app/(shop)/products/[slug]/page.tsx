export default function ProductPage({ params }: { params: { slug: string } }) {
  return <div>Product: {params.slug}</div>
}
