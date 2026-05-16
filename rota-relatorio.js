function gerarTextoRelatorio(){

    let texto = "";

    texto += "ROTA FINALIZADA\n\n";

    texto += `Quantidade de hotéis: ${rotaAtual.historico.length}\n\n`;

    rotaAtual.historico.forEach(item => {

        const hotel = obterLocalPorId(item.hotelId);

        const tempo = Math.floor(
            (item.saida - item.chegada) / 1000 / 60
        );

        texto += `${hotel?.nome || "Hotel"}\n`;

        texto += `Tempo: ${tempo} min\n`;

        texto += `Entrega: ${item.entrega ? "Sim" : "Não"}\n`;

        texto += `Coleta: ${item.coleta ? "Sim" : "Não"}\n\n`;

    });

    const blob = new Blob([texto], { type: "text/plain" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "relatorio-rota.txt";

    a.click();
}
