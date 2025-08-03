'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { Transaction } from '@/types/transaction';
import { useTheme } from 'next-themes';

interface ExpenseChartsProps {
  transactions: Transaction[];
}

export default function ExpenseCharts({ transactions }: ExpenseChartsProps) {
  const { theme } = useTheme();
  const pieChartRef = useRef<SVGSVGElement>(null);
  const lineChartRef = useRef<SVGSVGElement>(null);

  // Process data for charts
  const getCategoryData = useCallback(() => {
    const categories = {
      grocery: 0,
      entertainment: 0,
      transportation: 0,
      food_drink: 0,
      shopping: 0,
      utilities: 0,
      healthcare: 0,
      education: 0,
      other: 0,
    };

    transactions.forEach(transaction => {
      Object.keys(categories).forEach(category => {
        const key = `is_${category}` as keyof Transaction;
        if (transaction[key]) {
          categories[category as keyof typeof categories] += transaction.cost;
        }
      });
    });

    return Object.entries(categories)
      .filter(([, value]) => value > 0)
      .map(([category, value]) => ({
        category: category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value
      }));
  }, [transactions]);

  const getTimeSeriesData = useCallback(() => {
    const dailyTotals = new Map<string, number>();
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date).toDateString();
      dailyTotals.set(date, (dailyTotals.get(date) || 0) + transaction.cost);
    });

    return Array.from(dailyTotals.entries())
      .map(([date, total]) => ({
        date: new Date(date),
        total
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [transactions]);

  // Draw pie chart
  useEffect(() => {
    const textColor = theme === 'dark' ? 'white' : 'black';
    if (!pieChartRef.current) return;

    const data = getCategoryData();
    if (data.length === 0) return;

    const svg = d3.select(pieChartRef.current);
    svg.selectAll('*').remove();

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 10;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie<{ value: number }>()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<{ value: number }>>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = g.selectAll('arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', (_, i) => color(i.toString()));

    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', textColor)
      .text(d => d.data.category);

  }, [transactions, getCategoryData, theme]);

  // Draw line chart
  useEffect(() => {
    const textColor = theme === 'dark' ? 'white' : 'black';
    if (!lineChartRef.current) return;

    const data = getTimeSeriesData();
    if (data.length === 0) return;

    const svg = d3.select(lineChartRef.current);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };

    svg.attr('width', width).attr('height', height);

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.total) || 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const line = d3.line<{ date: Date; total: number }>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.total))
      .curve(d3.curveMonotoneX);

    // Bottom axis
    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%m/%d')))
      .call(g => g.selectAll('text').attr('fill', textColor)) // ← Axis labels
      .call(g => g.selectAll('line').attr('stroke', textColor)) // ← Tick lines
      .call(g => g.selectAll('path').attr('stroke', textColor)); // ← Axis line

    // Left axis
    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).tickFormat(d => `${d}`))
      .call(g => g.selectAll('text').attr('fill', textColor))
      .call(g => g.selectAll('line').attr('stroke', textColor))
      .call(g => g.selectAll('path').attr('stroke', textColor));

    // Add line
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add dots
    svg.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.total))
      .attr('r', 4)
      .attr('fill', '#3b82f6');

  }, [transactions, getTimeSeriesData, theme]);

  const categoryData = getCategoryData();
  const timeSeriesData = getTimeSeriesData();

  return (
    <div className="space-y-8">
      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-black">Expenses by Category</h3>
        {categoryData.length > 0 ? (
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <svg ref={pieChartRef}></svg>
            </div>
            <div className="space-y-2">
              {categoryData.map((item, index) => (
                <div key={item.category} className="flex items-center space-x-3 text-black">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: d3.schemeCategory10[index % 10] }}
                  ></div>
                  <span className="text-sm font-medium">{item.category}</span>
                  <span className="text-sm text-gray-600">
                    ${item.value.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No category data available</p>
        )}
      </div>

      {/* Daily Spending Trend */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-black">Daily Spending Trend</h3>
        {timeSeriesData.length > 0 ? (
          <div className="overflow-x-auto">
            <svg ref={lineChartRef}></svg>
          </div>
        ) : (
          <p className="text-gray-500">No trend data available</p>
        )}
      </div>
    </div>
  );
}