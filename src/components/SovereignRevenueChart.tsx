import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function SovereignRevenueChart() {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Clear previous renders
    d3.select(chartRef.current).selectAll('*').remove();

    // Setup Dimensions
    const width = chartRef.current.clientWidth;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('style', 'max-width: 100%; height: auto;');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // 1. Data Generation (Historical Trend + Sovereign Model)
    const generateHistoricalData = () => {
      const data = [];
      const now = new Date();
      let totalAmount = 15000;
      for (let i = 30; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        totalAmount += Math.random() * 5000 + 1000;
        data.push({
          date: d,
          amount: totalAmount,
          creator: totalAmount * 0.90,
          network: totalAmount * 0.09,
          burn: totalAmount * 0.01,
        });
      }
      return data;
    };

    const data = generateHistoricalData();

    // 2. Scales
    const x = d3.scaleTime()
      .domain(d3.extent(data, (d) => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d.amount) as number])
      .range([innerHeight, 0]);

    // 3. Axes
    const xAxis = d3.axisBottom(x)
      .ticks(6)
      .tickFormat((d) => d3.timeFormat('%b %d')(d as Date));
    
    const yAxis = d3.axisLeft(y)
      .ticks(5)
      .tickFormat((d) => `$${(d as number) / 1000}k`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .call((g) => g.select('.domain').attr('stroke', 'rgba(255,255,255,0.1)'))
      .call((g) => g.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.1)'))
      .call((g) => g.selectAll('.tick text').attr('fill', '#94a3b8'));

    g.append('g')
      .call(yAxis)
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.1)').attr('x2', innerWidth))
      .call((g) => g.selectAll('.tick text').attr('fill', '#94a3b8').attr('x', -10));

    // 4. Stacked Area for 90/9/1 Breakdown
    const stack = d3.stack<any>()
      .keys(['creator', 'network', 'burn']);
    
    const series = stack(data);

    const colors = ['#10b981', '#6366f1', '#f59e0b']; // emerald (Creator), indigo (Network), amber (Burn)

    const area = d3.area<any>()
      .x((d) => x(d.data.date))
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]))
      .curve(d3.curveMonotoneX);

    g.selectAll('.layer')
      .data(series)
      .enter()
      .append('path')
      .attr('class', 'layer')
      .attr('d', area)
      .style('fill', (d, i) => colors[i])
      .style('opacity', 0.8)
      .on('mouseover', function() {
        d3.select(this).style('opacity', 1);
      })
      .on('mouseout', function() {
        d3.select(this).style('opacity', 0.8);
      });

    // 5. Tooltip (Simplified interaction)
    const tooltip = g.append('g').style('display', 'none');
    tooltip.append('circle').attr('r', 4).attr('fill', 'white');
    tooltip.append('text')
      .attr('x', 9)
      .attr('dy', '.35em')
      .style('fill', 'white')
      .style('font-size', '12px')
      .style('font-weight', 'bold');

  }, []);

  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 z-10 relative">
        <div>
          <h3 className="text-white font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-Time D3 Sovereign Distribution
          </h3>
          <p className="text-xs text-slate-400 mt-1">Cumulative earnings & 90/9/1 Protocol Split tracking</p>
        </div>
        
        <div className="flex items-center gap-3 mt-3 sm:mt-0 bg-slate-950 p-2 rounded-lg border border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            Creator (90%)
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            Protocol (9%)
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            Treasury (1%)
          </div>
        </div>
      </div>

      <div ref={chartRef} className="w-full h-[300px] z-10 relative"></div>
    </div>
  );
}
