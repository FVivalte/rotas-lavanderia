// =========================
// ELEMENTO
// =========================

const reportMode =
  document.getElementById(
    'reportMode'
  );

// =========================
// RENDER
// =========================

function renderReportMode(){

  reportMode.innerHTML = '';

  routeReport.forEach((r, idx) => {

    const h =
      HOTELS.find(
        x => x.id === r.id
      );

    reportMode.innerHTML += `

      <div class="report-row">

        <strong>

          ${idx + 1}.
          ${h.name}

        </strong>

        <div>

          ${h.region}

        </div>

        <div>

          Fotos:
          ${r.fotos.length}

        </div>

      </div>
    `;
  });
}

// =========================
// PDF
// =========================

function gerarPDF(){

  const { jsPDF } =
    window.jspdf;

  const doc =
    new jsPDF();

  // HEADER

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

  let y = 45;

  // HOTÉIS

  routeReport.forEach((r, idx) => {

    const h =
      HOTELS.find(
        x => x.id === r.id
      );

    // CARD

    doc.setFillColor(
      245,
      245,
      245
    );

    doc.roundedRect(

      10,

      y,

      190,

      60,

      4,

      4,

      'F'
    );

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

    doc.setFontSize(10);

    doc.text(

      h.region,

      16,

      y + 20
    );

    doc.text(

      h.address,

      16,

      y + 28
    );

    // FOTO

    if(

      r.fotos &&
      r.fotos.length > 0

    ){

      try{

        doc.addImage(

          r.fotos[0],

          'JPEG',

          145,

          y + 5,

          40,

          40
        );

      }catch(e){

        console.error(e);
      }

    }

    y += 70;

    // NOVA PÁGINA

    if(y > 240){

      doc.addPage();

      y = 20;
    }
  });

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