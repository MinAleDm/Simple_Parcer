const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://easycomm.ru/cat'; 

async function parseAndGenerateChart() {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const headingsCount = {
      h1: $('h1').length,
      h2: $('h2').length,
      h3: $('h3').length
    };

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Heading Chart</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          canvas { max-width: 600px; }
        </style>
      </head>
      <body>
        <h2>График количества заголовков на странице ${url}</h2>
        <canvas id="headingChart"></canvas>
        <script>
          const ctx = document.getElementById('headingChart').getContext('2d');
          new Chart(ctx, {
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
              scales: {
                y: {
                  beginAtZero: true,
                  precision: 0
                }
              }
            }
          });
        </script>
      </body>
      </html>
    `;

    fs.writeFileSync('chart.html', htmlTemplate);
    console.log('✅ Готово! Открой файл chart.html в браузере.');
  } catch (error) {
    console.error('Ошибка:', error.message);    
  }
}

parseAndGenerateChart();
