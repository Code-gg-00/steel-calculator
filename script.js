// 显示当前日期和时间
function updateDateTime() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById('datetime').textContent = `登录时间：${dateStr} ${timeStr}`;
}
setInterval(updateDateTime, 1000);
updateDateTime();

// 获取当前日期（不带时间）
function getCurrentDateStr() {
  const now = new Date();
  return now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// 动态生成钢材输入表单
const startInputBtn = document.getElementById('start-input');
const dynamicFormSection = document.getElementById('dynamic-form');
const resultSection = document.getElementById('result-section');

startInputBtn.addEventListener('click', function() {
  const count = parseInt(document.getElementById('steel-count').value, 10);
  if (isNaN(count) || count < 1 || count > 20) {
    alert('请输入1-20之间的钢材种类数');
    return;
  }
  let formHtml = '<form id="steel-form">';
  for (let i = 0; i < count; i++) {
    formHtml += `
      <div class="steel-row-group">
        <div class="steel-row-title"><span>钢材${i+1}</span> <input type="text" name="name${i}" placeholder="名称" required style="width:80px;"></div>
        <div class="steel-row-group-inner">
          <div class="steel-group">
            <span class="group-label">采购</span>
            <input type="number" name="buyWeight${i}" placeholder="重量(kg)" min="0" step="0.01" required>
            <input type="number" name="buyPrice${i}" placeholder="单价(元/kg)" min="0" step="0.01" required>
          </div>
          <div class="steel-group">
            <span class="group-label">售卖</span>
            <input type="number" name="sellWeight${i}" placeholder="重量(kg)" min="0" step="0.01" required>
            <input type="number" name="sellPrice${i}" placeholder="单价(元/kg)" min="0" step="0.01" required>
          </div>
        </div>
      </div>
    `;
  }
  
  // 添加其他支出种类数输入
  formHtml += `
    <div class="steel-row-group other-expenses-config">
      <div class="steel-row-title"><span>其他支出设置</span></div>
      <div class="steel-row-group-inner">
        <div class="steel-group">
          <span class="group-label">支出种类数：</span>
          <input type="number" id="expenses-count" min="0" max="10" value="0" style="width:60px;">
          <button type="button" id="generate-expenses">生成支出项</button>
        </div>
      </div>
    </div>
  `;
  
  // 其他支出项目容器
  formHtml += `<div id="expenses-container"></div>`;
  
  formHtml += '<button type="submit" id="calc-btn">计算</button></form>';
  dynamicFormSection.innerHTML = formHtml;
  resultSection.innerHTML = '';
  document.getElementById('chart-section').innerHTML = '';

  // 生成其他支出项目
  document.getElementById('generate-expenses').addEventListener('click', function() {
    const expensesCount = parseInt(document.getElementById('expenses-count').value, 10);
    const expensesContainer = document.getElementById('expenses-container');
    
    if (isNaN(expensesCount) || expensesCount < 0 || expensesCount > 10) {
      alert('请输入0-10之间的支出种类数');
      return;
    }
    
    let expensesHtml = '';
    for (let i = 0; i < expensesCount; i++) {
      expensesHtml += `
        <div class="steel-row-group other-expenses">
          <div class="steel-row-title"><span>支出${i+1}</span></div>
          <div class="steel-row-group-inner">
            <div class="steel-group">
              <input type="text" name="expensesDesc${i}" placeholder="支出描述" style="width:120px;" required>
              <input type="number" name="expensesAmount${i}" placeholder="金额(元)" min="0" step="0.01" required>
            </div>
          </div>
        </div>
      `;
    }
    expensesContainer.innerHTML = expensesHtml;
  });

  // 计算功能
  document.getElementById('steel-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const form = e.target;
    let rows = [];
    let totalBuy = 0, totalSell = 0, totalProfit = 0;
    
    // 获取其他支出
    const expensesCount = parseInt(document.getElementById('expenses-count').value, 10) || 0;
    let otherExpensesList = [];
    let totalOtherExpenses = 0;
    
    for (let i = 0; i < expensesCount; i++) {
      const desc = form[`expensesDesc${i}`] ? form[`expensesDesc${i}`].value.trim() : '';
      const amount = form[`expensesAmount${i}`] ? parseFloat(form[`expensesAmount${i}`].value) || 0 : 0;
      
      if (desc && amount > 0) {
        otherExpensesList.push({ desc, amount });
        totalOtherExpenses += amount;
      }
    }
    
    for (let i = 0; i < count; i++) {
      const name = form[`name${i}`].value.trim() || `钢材${i+1}`;
      const buyWeight = parseFloat(form[`buyWeight${i}`].value) || 0;
      const buyPrice = parseFloat(form[`buyPrice${i}`].value) || 0;
      const sellWeight = parseFloat(form[`sellWeight${i}`].value) || 0;
      const sellPrice = parseFloat(form[`sellPrice${i}`].value) || 0;
      const buyTotal = buyWeight * buyPrice;
      const sellTotal = sellWeight * sellPrice;
      const profit = sellTotal - buyTotal;
      totalBuy += buyTotal;
      totalSell += sellTotal;
      totalProfit += profit;
      rows.push({ name, buyWeight, buyPrice, buyTotal, sellWeight, sellPrice, sellTotal, profit });
    }
    
    // 计算最终盈利（减去其他支出）
    const finalProfit = totalProfit - totalOtherExpenses;
    
    // 生成结果表格
    const dateStr = getCurrentDateStr();
    let tableHtml = `<div class="result-date">日期：${dateStr}</div>`;
    tableHtml += `<div class="result-table-wrap"><table class="result-table"><thead><tr>
      <th>名称</th><th>采购重量(kg)</th><th>采购单价</th><th>采购费用</th><th>售卖重量(kg)</th><th>售卖单价</th><th>售卖收入</th><th>盈利</th>
    </tr></thead><tbody>`;
    rows.forEach(row => {
      tableHtml += `<tr>
        <td>${row.name}</td>
        <td>${row.buyWeight.toFixed(2)}</td>
        <td>${row.buyPrice.toFixed(2)}</td>
        <td>${row.buyTotal.toFixed(2)}</td>
        <td>${row.sellWeight.toFixed(2)}</td>
        <td>${row.sellPrice.toFixed(2)}</td>
        <td>${row.sellTotal.toFixed(2)}</td>
        <td style="color:${row.profit>=0?'#4caf50':'#f44336'};font-weight:bold;">${row.profit.toFixed(2)}</td>
      </tr>`;
    });
    
    // 添加其他支出行
    otherExpensesList.forEach(expense => {
      tableHtml += `<tr class="expenses-row">
        <td>${expense.desc}</td>
        <td>-</td><td>-</td>
        <td>${expense.amount.toFixed(2)}</td>
        <td>-</td><td>-</td><td>-</td>
        <td style="color:#f44336;font-weight:bold;">-${expense.amount.toFixed(2)}</td>
      </tr>`;
    });
    
    tableHtml += `</tbody><tfoot><tr style="font-weight:bold;background:#132743;">
      <td>合计</td><td></td><td></td><td>${(totalBuy + totalOtherExpenses).toFixed(2)}</td><td></td><td></td><td>${totalSell.toFixed(2)}</td><td style="color:${finalProfit>=0?'#4caf50':'#f44336'};">${finalProfit.toFixed(2)}</td>
    </tr></tfoot></table></div>`;
    resultSection.innerHTML = tableHtml;

    // 用Canvas手动绘制表格图片，包含日期时间
    const chartSection = document.getElementById('chart-section');
    chartSection.innerHTML = '';
    // 生成表格图片
    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      // 画布参数
      const colTitles = ['名称', '采购重量(kg)', '采购单价', '采购费用', '售卖重量(kg)', '售卖单价', '售卖收入', '盈利'];
      const colWidths = [90, 110, 90, 90, 110, 90, 90, 90];
      const tableWidth = colWidths.reduce((a, b) => a + b, 0) + 40;
      const rowHeight = 38;
      const headHeight = 44;
      const dateHeight = 38;
      const totalRows = rows.length + 2 + otherExpensesList.length; // 表头+数据+其他支出+合计
      const canvasHeight = dateHeight + headHeight + rowHeight * (totalRows - 1) + 30;
      const canvas = document.createElement('canvas');
      canvas.width = tableWidth * 2; // 提高清晰度
      canvas.height = canvasHeight * 2;
      canvas.style.width = tableWidth + 'px';
      canvas.style.height = canvasHeight + 'px';
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      
      // 背景 - 简约风格使用白色背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, tableWidth, canvasHeight);
      
      // 日期时间 - 简约风格
      ctx.fillStyle = '#333333';
      ctx.font = '16px Segoe UI, Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`日期：${dateStr}  时间：${timeStr}`, 20, 28);
      
      // 表头 - 简约风格
      let x = 20, y = dateHeight;
      ctx.font = 'bold 15px Segoe UI, Arial';
      
      // 先画一个表头背景
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(x, y, tableWidth - 40, headHeight);
      
      // 表头文字
      for (let i = 0; i < colTitles.length; i++) {
        ctx.fillStyle = '#333333';
        ctx.fillText(colTitles[i], x + colWidths[i]/2 - 15, y + 28);
        x += colWidths[i];
      }
      
      // 数据行 - 简约风格
      y += headHeight;
      ctx.font = '14px Segoe UI, Arial';
      for (let r = 0; r < rows.length; r++) {
        x = 20;
        const row = rows[r];
        const vals = [row.name, row.buyWeight.toFixed(2), row.buyPrice.toFixed(2), row.buyTotal.toFixed(2), row.sellWeight.toFixed(2), row.sellPrice.toFixed(2), row.sellTotal.toFixed(2), row.profit.toFixed(2)];
        
        // 交替行背景 - 更轻的颜色
        ctx.fillStyle = r % 2 === 0 ? '#ffffff' : '#f8f9fa';
        ctx.fillRect(x, y, tableWidth - 40, rowHeight);
        
        // 数据文字
        for (let c = 0; c < vals.length; c++) {
          ctx.fillStyle = c === 7 ? (row.profit >= 0 ? '#4caf50' : '#f44336') : '#333333';
          ctx.fillText(vals[c], x + colWidths[c]/2 - 15, y + 25);
          x += colWidths[c];
        }
        y += rowHeight;
      }
      
      // 其他支出行 - 简约风格
      otherExpensesList.forEach((expense, index) => {
        x = 20;
        const vals = [expense.desc, '-', '-', expense.amount.toFixed(2), '-', '-', '-', '-' + expense.amount.toFixed(2)];
        
        // 支出行背景色 - 轻微突出
        ctx.fillStyle = '#fff8e1';
        ctx.fillRect(x, y, tableWidth - 40, rowHeight);
        
        // 支出行文字
        for (let c = 0; c < vals.length; c++) {
          ctx.fillStyle = c === 7 ? '#f44336' : '#333333';
          ctx.fillText(vals[c], x + colWidths[c]/2 - 15, y + 25);
          x += colWidths[c];
        }
        y += rowHeight;
      });
      
      // 合计行 - 简约风格
      x = 20;
      ctx.font = 'bold 15px Segoe UI, Arial';
      
      // 合计行背景
      ctx.fillStyle = '#f1f8e9';
      ctx.fillRect(x, y, tableWidth - 40, rowHeight);
      
      // 合计行文字
      for (let c = 0; c < colTitles.length; c++) {
        ctx.fillStyle = c === 0 ? '#333333' : (c === 3 ? '#333333' : (c === 6 ? '#333333' : (c === 7 ? (finalProfit >= 0 ? '#4caf50' : '#f44336') : '#333333')));
        let txt = '';
        if (c === 0) txt = '合计';
        if (c === 3) txt = (totalBuy + totalOtherExpenses).toFixed(2);
        if (c === 6) txt = totalSell.toFixed(2);
        if (c === 7) txt = finalProfit.toFixed(2);
        ctx.fillText(txt, x + colWidths[c]/2 - 15, y + 25);
        x += colWidths[c];
      }
      
      // 简约风格表格线 - 更轻的颜色和更细的线
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 0.5;
      
      // 水平线
      for (let r = 0; r <= totalRows; r++) {
        ctx.beginPath();
        ctx.moveTo(20, dateHeight + r * (r === 0 ? headHeight : rowHeight));
        ctx.lineTo(tableWidth - 20, dateHeight + r * (r === 0 ? headHeight : rowHeight));
        ctx.stroke();
      }
      
      // 垂直线
      let xLine = 20;
      for (let c = 0; c <= colTitles.length; c++) {
        ctx.beginPath();
        ctx.moveTo(xLine, dateHeight);
        ctx.lineTo(xLine, dateHeight + headHeight + (totalRows - 1) * rowHeight);
        ctx.stroke();
        if (c < colTitles.length) xLine += colWidths[c];
      }
      
      // 提示
      const tip = document.createElement('div');
      tip.textContent = '长按图片可保存到手机';
      tip.style.color = '#666666';
      tip.style.fontSize = '0.9rem';
      tip.style.textAlign = 'center';
      tip.style.margin = '0.5rem 0 0.2rem 0';
      chartSection.appendChild(tip);
      
      // 图片
      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      img.alt = '钢材盈利表格';
      img.style.maxWidth = '100%';
      img.style.marginTop = '0.2rem';
      img.style.borderRadius = '8px';
      img.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      chartSection.appendChild(img);
    }, 200);
  });
}); 