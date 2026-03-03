import NetworkCategoryPage from "@/components/NetworkCategoryPage";

export default function NetworkHoteis() {
  return (
    <NetworkCategoryPage
      categoria="hoteis"
      titulo="Hotéis e Resorts"
      descricao="Gerencie contatos corporativos do setor hoteleiro"
      tiposEstabelecimento={["Hotel", "Resort", "Pousada", "Apart-hotel", "Hostel"]}
    />
  );
}
