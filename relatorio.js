// =========================
// ELEMENTO RELATÓRIO
// =========================

const reportMode =
  document.getElementById(
    'reportMode'
  );

// =========================
// RELATÓRIO VISUAL
// =========================

function renderReportMode(){

  if(!reportMode){

    return;
  }

  reportMode.innerHTML = '';

  routeReport.forEach((r, idx) => {

    if(!r.chegada){

      return;
    }

    const h =
      HOTELS.find(
        x => x.id === r.id
      );

    if(!h){

      return;
    }

    const chegada =
      new Date(r.chegada)
      .toLocaleTimeString([], {

        hour:'2-digit',

        minute:'2-digit'
      });

    const saida =
      r.saida
      ? new Date(r.saida)
        .toLocaleTimeString([], {

          hour:'2-digit',

          minute:'2-digit'
        })
      : '--:--';

    let tags = [];

    if(r.entrega){

      tags.push('Entrega');
    }

    if(r.coleta){

      tags.push('Coleta');
    }

    reportMode.innerHTML += `

      <div class="report-row">

        <strong>

          ${idx + 1}.
          ${h.name}

        </strong>

        <div class="muted">

          ${h.region}

        </div>

        <div class="muted">

          ${h.address}

        </div>

        <div
          class="muted"
          style="margin-top:6px;"
        >

          ${tags.join(' • ') || 'Sem serviço'}

        </div>

        <div
          class="muted"
          style="margin-top:4px;"
        >

          Chegada:
          ${chegada}

          •

          Saída:
          ${saida}

        </div>

        <div
          class="muted"
          style="margin-top:4px;"
        >

          Fotos:
          ${r.fotos?.length || 0}

        </div>

      </div>
    `;
  });
}

// =========================
// GERAR PDF
// =========================

function gerarPDF(){


alert('PDF NOVO');




  const { jsPDF } =
    window.jspdf;

  const doc =
    new jsPDF({

      orientation:'portrait',

      unit:'mm',

      format:'a4'
    });

  let y = 20;

  // =========================
  // HEADER
  // =========================

  y =
    desenharHeaderPDF(
      doc,
      y
    );

  // =========================
  // HOTÉIS
  // =========================

  routeReport.forEach((r, idx) => {

    if(!r.chegada){

      return;
    }

    y =
      quebrarPaginaPDF(
        doc,
        y
      );

    y =
      desenharHotelCardPDF(

        doc,

        r,

        idx,

        y
      );
  });

  // =========================
  // FOOTER
  // =========================

  desenharFooterPDF(doc);

  // =========================
  // SALVAR
  // =========================

  salvarPDF(doc);
}

// =========================
// HEADER PDF
// =========================

function desenharHeaderPDF(
  doc,
  y
){

  doc.setFillColor(
    20,
    20,
    20
  );

  doc.rect(
    0,
    0,
    210,
    30,
    'F'
  );

  doc.setTextColor(
    255,
    255,
    255
  );

  doc.setFontSize(22);

  doc.text(

    'RELATÓRIO DE ROTA',

    105,

    18,

    {
      align:'center'
    }
  );

  doc.setFontSize(10);

  doc.text(

    APP_CONFIG.city,

    14,

    38
  );

  doc.text(

    `Motorista: ${APP_CONFIG.driver}`,

    14,

    44
  );

  doc.text(

    `Data: ${
      new Date()
      .toLocaleDateString(
        'pt-BR'
      )
    }`,

    150,

    38
  );

  doc.text(

    `Total: ${
      routeReport.length
    } hotéis`,

    150,

    44
  );

  return 55;
}

// =========================
// CARD HOTEL PDF
// =========================

function desenharHotelCardPDF(

  doc,

  r,

  idx,

  y
){

  const h =
    HOTELS.find(
      x => x.id === r.id
    );

  if(!h){

    return y;
  }

  // =========================
  // CARD
  // =========================

  doc.setFillColor(
    248,
    248,
    248
  );

  doc.roundedRect(

    10,

    y,

    190,

    58,

    4,

    4,

    'F'
  );

  // =========================
  // TÍTULO
  // =========================

  doc.setTextColor(
    20,
    20,
    20
  );

  doc.setFontSize(14);

  doc.text(

    `${idx + 1}. ${h.name}`,

    16,

    y + 10
  );

  // =========================
  // REGIÃO
  // =========================

  doc.setFontSize(10);

  doc.text(

    h.region,

    16,

    y + 18
  );

  // =========================
  // ENDEREÇO
  // =========================

  doc.setFontSize(9);

  doc.text(

    h.address,

    16,

    y + 26,

    {
      maxWidth: 110
    }
  );

  // =========================
  // HORÁRIOS
  // =========================

  const chegada =
    new Date(r.chegada)
    .toLocaleTimeString([], {

      hour:'2-digit',

      minute:'2-digit'
    });

  const saida =
    r.saida
    ? new Date(r.saida)
      .toLocaleTimeString([], {

        hour:'2-digit',

        minute:'2-digit'
      })
    : '--:--';

  doc.setFontSize(10);

  doc.text(

    `Chegada: ${chegada}`,

    16,

    y + 40
  );

  doc.text(

    `Saída: ${saida}`,

    70,

    y + 40
  );

  // =========================
  // SERVIÇOS
  // =========================

  let servicos = [];

  if(r.entrega){

    servicos.push(
      'Entrega'
    );
  }

  if(r.coleta){

    servicos.push(
      'Coleta'
    );
  }

  doc.text(

    `Serviços: ${
      servicos.join(', ')
      || 'Sem serviço'
    }`,

    16,

    y + 48
  );

  // =========================
  // FOTO
  // =========================

  doc.setDrawColor(
    180
  );

  doc.rect(

    145,

    y + 8,

    40,

    40
  );

  // FOTO REAL

  if(

    r.fotos &&
    r.fotos.length > 0

  ){

    try{

      doc.addImage(

        r.fotos[0],

        'JPEG',

        145,

        y + 8,

        40,

        40
      );

    }catch(e){

      console.error(e);

      doc.text(

        'Erro foto',

        154,

        y + 30
      );
    }

  }else{

    doc.setFontSize(10);

    doc.text(

      'SEM FOTO',

      152,

      y + 30
    );
  }

  return y + 68;
}

// =========================
// QUEBRA PÁGINA
// =========================

function quebrarPaginaPDF(
  doc,
  y
){

  if(y > 230){

    doc.addPage();

    return 20;
  }

  return y;
}

// =========================
// FOOTER PDF
// =========================

function desenharFooterPDF(doc){

  const paginas =
    doc.getNumberOfPages();

  for(

    let i = 1;

    i <= paginas;

    i++

  ){

    doc.setPage(i);

    doc.setFontSize(8);

    doc.setTextColor(
      120
    );

    doc.text(

      `Página ${i} de ${paginas}`,

      105,

      290,

      {
        align:'center'
      }
    );
  }
}

// =========================
// SALVAR PDF
// =========================

function salvarPDF(doc){

  doc.save(

    APP_CONFIG.pdfName
  );
}

// =========================
// EVENTO PDF
// =========================

document
  .getElementById('btn-pdf')
  ?.addEventListener(

    'click',

    gerarPDF
  );

// =========================
// EXPORT GLOBAL
// =========================

window.renderReportMode =
  renderReportMode;

window.gerarPDF =
  gerarPDF;