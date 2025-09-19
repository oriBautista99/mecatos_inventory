export default function Page({ params }: { params: { orderId: string } }) {

    return(
        <div>
            <h1>Recibir orden N {params.orderId}</h1>
        </div>
    );
}