/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */


            ${formatStatus(
    linear-gradient(
      180deg,
      #FFFFFF,
      #FAFBFC
    );

  border:
    1px solid #D6DAE1;

  border-radius: 24px;

  padding: 26px;

  text-align: center;

  box-shadow:
    0 6px 16px
    rgba(102,108,192,0.06);
}

.card .label {

  color: #6E87C0;

  font-size: 14px;

  margin-bottom: 10px;

  font-weight: 700;
}

.card .value {

  color: #292B2E;

  font-size: 28px;

  font-weight: 800;
}

.section-title {

  color: #666CC0;

  font-size: 28px;

  font-weight: 800;

  margin:
    0 0 20px;
}

table {

  width: 100%;

  border-collapse: collapse;

  background: white;

  border-radius: 24px;

  overflow: hidden;

  box-shadow:
    0 8px 24px
    rgba(0,0,0,0.04);
}

th {

  background:
    linear-gradient(
      135deg,
      #666CC0,
      #6E87C0
    );

  color: white;

  padding: 18px;

  text-align: right;

  font-size: 14px;
}

td {

  padding: 18px;

  border-bottom:
    1px solid #E5E9F1;

  color: #292B2E;

  font-size: 14px;
}

tr:nth-child(even) td {

  background: #FAFBFC;
}

.footer {

  margin-top: 40px;

  text-align: center;

  color: #63676E;

  font-size: 14px;

  padding-bottom: 30px;
}

</style>

</head>

<body>

<div class="wrapper">

  <div class="header">

    <img
      src="https://zpijpebyajnkxsrnrfre.supabase.co/storage/v1/object/public/assets/dierha-logo.png"
    />

    <h1>
      ديرها
    </h1>

    <p>
      تقرير إدارة الاشتراكات
    </p>

  </div>

  <div class="content">

    <div class="info">

      <div>

        الحساب:
        ${user.name}

      </div>

      <div>

        البريد الإلكتروني:
        ${user.email}

      </div>

      <div>

        تاريخ الإصدار:
        ${new Date()
          .toLocaleDateString(
            'ar-SA',
          )}

      </div>

    </div>

    <div class="cards">

      <div class="card">

        <div class="label">
          عدد الاشتراكات
        </div>

        <div class="value">
          ${rows.length}
        </div>

      </div>

      <div class="card">

        <div class="label">
          الإجمالي الشهري
        </div>

        <div class="value">

          ${monthlyTotal.toFixed(
            2,
          )}

          ريال

        </div>

      </div>

      <div class="card">

        <div class="label">
          الإجمالي السنوي
        </div>

        <div class="value">

          ${yearlyTotal.toFixed(
            2,
          )}

          ريال

        </div>

      </div>

    </div>

    <h2 class="section-title">

      جدول الاشتراكات

    </h2>

    <table>

      <thead>

        <tr>

          <th>الخدمة</th>

          <th>التصنيف</th>

          <th>السعر</th>

          <th>دورة الدفع</th>

          <th>تاريخ التجديد</th>

          <th>الحالة</th>

        </tr>

      </thead>

      <tbody>

        ${tableRows}

      </tbody>

    </table>

    <div class="footer">

      ديرها | منصة إدارة الاشتراكات

    </div>

  </div>

</div>

</body>

</html>
`;

  const browser =
    await puppeteer.launch({

      headless: true,
    });

  const page =
    await browser.newPage();

  await page.setContent(
    html,
    {
      waitUntil: 'load',
    },
  );

  const pdf = await page.pdf({

    format: 'A4',

    printBackground: true,

    margin: {

      top: '0mm',

      right: '0mm',

      bottom: '0mm',

      left: '0mm',
    },
  });

  await browser.close();

  return Buffer.from(pdf);
}
