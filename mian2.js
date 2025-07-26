const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://easycomm.ru/cat'; 

async function parsePage() {
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    // 1. Заголовки
    const headingsCount = {
      h1: $('h1').length,
      h2: $('h2').length,
      h3: $('h3').length
    };

    // 2. Meta description
    const description = $('meta[name="description"]').attr('content') || 'Не найдено';

    // 3. Email
    const emails = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];

    // 4. Телефоны 
    const phones = (html.match(/\+7\d{10}/g) || []).filter((v, i, a) => a.indexOf(v) === i); 

    // 5. Контактные ссылки
    const contactLinks = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href')?.toLowerCase();
      const text = $(el).text().toLowerCase();
      if ((href && href.includes('contact')) || text.includes('контакт') || text.includes('contact')) {
        contactLinks.push(href);
      }
    });

    // 6. Кол-во картинок
    const imagesCount = $('img').length;

    // 7. Генерация HTML-отчета
    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <title>Анализ страницы</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body { font-family: sans-serif; padding: 20px; line-height: 1.6; }
          canvas { max-width: 700px; margin-top: 30px; }
          .info { margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>Анализ страницы: ${url}</h1>

        <h2>Описание</h2>
        <p>${description}</p>

        <h2>Контактная информация</h2>
        <p><strong>Email:</strong> ${emails.length ? emails.join(', ') : 'Не найдено'}</p>
        <p><strong>Телефоны (+7):</strong> ${phones.length ? phones.join(', ') : 'Не найдено'}</p>
        <p><strong>Контактные ссылки:</strong> ${
          contactLinks.length ? contactLinks.map(link => `<a href="${link}">${link}</a>`).join('<br>') : 'Не найдено'
        }</p>

        <h2>График заголовков</h2>
        <canvas id="headingChart"></canvas>

        <h2>Дополнительная информация</h2>
        <canvas id="infoChart"></canvas>

        <script>
          // Заголовки
          new Chart(document.getElementById('headingChart').getContext('2d'), {
            type: 'bar',
            data: {
              labels: ['H1', 'H2', 'H3'],
              datasets: [{
                label: 'Количество заголовков',
                data: [${headingsCount.h1}, ${headingsCount.h2}, ${headingsCount.h3}],
                backgroundColor: ['#4e79a7', '#f28e2b', '#e15759']
              }]
            },
            options: {
              responsive: true,
              scales: { y: { beginAtZero: true, precision: 0 } }
            }
          });

          // Общая информация
          new Chart(document.getElementById('infoChart').getContext('2d'), {
            type: 'pie',
            data: {
              labels: ['Emails', 'Телефоны', 'Контактные ссылки', 'Изображения'],
              datasets: [{
                label: 'Информация',
                data: [${emails.length}, ${phones.length}, ${contactLinks.length}, ${imagesCount}],
                backgroundColor: ['#76b041', '#ffb000', '#d11141', '#00aedb']
              }]
            },
            options: {
              responsive: true
            }
          });
        </script>
      </body>
      </html>
    `;

    fs.writeFileSync('report.html', htmlTemplate);
    console.log('✅');

  } catch (error) {
    console.error('❌', error.message);
  }
}

parsePage();
