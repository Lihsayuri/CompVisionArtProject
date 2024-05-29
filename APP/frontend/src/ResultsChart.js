import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ResultsChart({ results }) {
  const scaleFactor = 1.25; // Adjust this factor to make differences more visible
  const scaledResults = results.map(result => ({
    ...result,
    probability: result.probability * scaleFactor,
  }));

  const maxValue = Math.max(...scaledResults.map(result => result.probability)) + 5; // Increase the max value by a larger margin

  const data = {
    labels: scaledResults.map(result => result.style),
    datasets: [
      {
        label: 'Probability (%)',
        data: scaledResults.map(result => result.probability),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'center',
      },
      title: {
        display: true,
        text: 'Artistic Style Prediction Results',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: maxValue,
        ticks: {
          stepSize: 5, // Adjust the step size to make differences more visible
          color: '#000', // Color of the y-axis labels
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
      },
      x: {
        ticks: {
          color: '#000', // Color of the x-axis labels
        },
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
      },
    },
  };

  return (
    <div style={{ backgroundColor: '#fff', display: 'flex', alignItems: 'center',padding: '20px', borderRadius: '8px', height: '300px'}}>
      <Bar data={data} options={options} />
    </div>
  );
}

export default ResultsChart;

