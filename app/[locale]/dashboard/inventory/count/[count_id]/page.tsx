import EditCount from "./editConunt";


export default async function Page(props: { params: Promise<{ count_id: string }> }) {

  const { count_id } = await props.params;

  return (
    <EditCount count_id={count_id}></EditCount>
  );
}