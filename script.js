$(document).ready(function () {
  // Store clock-in time
  let clockInTime = null;

  // Calculate Totals
  window.calculateTotals = function () {
    console.log('calculateTotals() triggered'); // Debug: Confirm function is called
    let total = 0;
    const menuItems = $('.menu-item:checked');
    console.log('Checked items:', menuItems.length); // Debug: Log number of checked items
    if (menuItems.length === 0) {
      alert('Please select at least one item to calculate!');
      $('#total, #commission').text('');
      return;
    }
    menuItems.each(function () {
      const price = parseFloat($(this).attr('data-price'));
      const quantity = parseInt($(this).next('.quantity').val()) || 1;
      const discount = parseFloat($('#discount').val()) || 0;
      console.log(`Processing item - Price: ${price}, Quantity: ${quantity}, Discount: ${discount}%`); // Debug: Log item details
      if (!isNaN(price) && !isNaN(quantity) && quantity > 0) {
        const itemTotal = price * quantity * (1 - (discount / 100));
        total += itemTotal;
        console.log(`Item: ${$(this).parent().text().trim()}, Item Total: ${itemTotal.toFixed(2)}`); // Debug: Log item total
      } else {
        console.warn(`Skipping item: Invalid price (${price}) or quantity (${quantity})`);
      }
    });
    const commission = total * 0.30;
    $('#total').text(total.toFixed(2));
    $('#commission').text(commission.toFixed(2));
    console.log(`Final Total: ${total.toFixed(2)}, Commission: ${commission.toFixed(2)}`); // Debug: Log final results
  };

  // Bind Calculate button
  $('#calculateBtn').click(function () {
    console.log('Calculate button clicked'); // Debug: Confirm button click
    window.calculateTotals();
  });

  // Submit Form
  window.SubForm = function () {
    const total = $('#total').text().trim();
    if (!total) {
      alert('Please calculate the total first!');
      return;
    }
    const employeeName = $('#employeeName').val().trim();
    if (!employeeName) {
      alert('Employee Name is required!');
      return;
    }
    const orderedItems = [];
    $('.menu-item:checked').each(function () {
      const itemName = $(this).parent().text().trim();
      const price = parseFloat($(this).attr('data-price'));
      const quantity = parseInt($(this).next('.quantity').val()) || 1;
      if (!isNaN(price) && !isNaN(quantity) && quantity > 0) {
        orderedItems.push({ name: itemName, price, quantity });
      }
    });
    if (orderedItems.length === 0) {
      alert('Please select at least one item!');
      return;
    }
    const totalValue = parseFloat(total);
    const commission = parseFloat($('#commission').text());
    const discount = parseFloat($('#discount').val());
    const formData = {
      'Employee Name': employeeName,
      Total: totalValue.toFixed(2),
      Commission: commission.toFixed(2),
      'Items Ordered': JSON.stringify(orderedItems),
      'Discount Applied': discount
    };
    const discordData = {
      username: 'Receipts',
      content: `New order submitted by ${employeeName}`,
      embeds: [{
        title: 'Order Details',
        fields: [
          { name: 'Employee Name', value: employeeName, inline: true },
          { name: 'Total', value: `$${totalValue.toFixed(2)}`, inline: true },
          { name: 'Commission', value: `$${commission.toFixed(2)}`, inline: true },
          { name: 'Discount Applied', value: `${discount}%`, inline: true },
          { name: 'Items Ordered', value: orderedItems.map(item => `${item.quantity}x ${item.name}`).join('\n') }
        ],
        color: 0x00ff00
      }]
    };
    $.when(
      $.ajax({
        url: 'https://api.apispreadsheets.com/data/TtRcPV26cYbuk6wH/',
        type: 'post',
        data: formData,
        headers: {
          accessKey: '219db3aaa892bb5e19e27b5ec9ed348a',
          secretKey: '8b9019c7605f42fcfc9f7a62dde61f63',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }),
      $.ajax({
        url: 'https://discord.com/api/webhooks/1385205975426007090/V5WJG8EcpX796FRfjLfep50GL9to2M1rDSsRKfFsmITjYIgKNs5th4pgJEN7c5zvmSlq',
        type: 'post',
        contentType: 'application/json',
        data: JSON.stringify(discordData),
        headers: {
          'Content-Type': 'application/json'
        }
      })
    ).then(function () {
      alert('Order submitted successfully!');
      resetForm();
    }).fail(function (xhr, status, error) {
      alert('Error submitting order. Please try again.');
      console.error(`Submission error: Status: ${xhr.status}, Error: ${error}, Response: ${xhr.responseText}`);
    });
  };

  // Reset Form
  window.resetForm = function () {
    $('.menu-item').prop('checked', false);
    $('.quantity').val(1);
    $('#total, #commission').text('');
    $('#discount').val('0');
  };

  // Clock In
  window.clockIn = function () {
    console.log('clockIn() triggered');
    const employeeName = $('#employeeName').val().trim();
    if (!employeeName) {
      alert('Employee Name is required!');
      console.warn('Clock-in aborted: Employee name is empty');
      return;
    }
    clockInTime = new Date();
    const localTime = clockInTime.toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }) || 'Unknown Time';
    console.log(`Clock In: Employee: ${employeeName}, Time: ${localTime}`);
    const discordData = {
      username: 'Pacific Bluffs Clock',
      embeds: [{
        title: 'Clock In',
        fields: [
          { name: 'Employee Name', value: employeeName, inline: true },
          { name: 'Time', value: localTime, inline: true }
        ],
        color: 0x0000ff
      }]
    };
    console.log('Sending clock-in webhook:', JSON.stringify(discordData));
    $.ajax({
      url: 'https://discord.com/api/webhooks/1385206248353304617/I30fwtDhWExcE3x_dFi5drhRSkVb18Hhitgb8epjTfuSU-KVyCFp3kbLs2gRKQ1LQguR',
      method: 'POST',
      contentType: 'application/json',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(discordData),
      success: function () {
        alert(`${employeeName} successfully clocked in at ${localTime}!`);
        console.log('Clock-in webhook sent successfully');
      },
      error: function (xhr, status, error) {
        alert('Error clocking in. Webhook may be invalid or unreachable. Check console for details.');
        console.error(`Clock-in webhook failed: Status: ${xhr.status}, Error: ${error}, Response: ${xhr.responseText}`);
      }
    });
  };

  // Clock Out
  window.clockOut = function () {
    console.log('clockOut() triggered');
    const employeeName = $('#employeeName').val().trim();
    if (!employeeName) {
      alert('Employee Name is required!');
      console.warn('Clock-out aborted: Employee name is empty');
      return;
    }
    if (!clockInTime) {
      alert('No clock-in time recorded. Please clock in first!');
      console.warn('Clock-out aborted: No clock-in time recorded');
      return;
    }
    const clockOutTime = new Date();
    const localTime = clockOutTime.toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }) || 'Unknown Time';
    // Calculate duration
    const durationMs = clockOutTime - clockInTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const durationText = hours > 0 ? `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}` : `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    console.log(`Clock Out: Employee: ${employeeName}, Time: ${localTime}, Duration: ${durationText}`);
    const discordData = {
      username: 'West Vinewood Clock',
      embeds: [{
        title: 'Clock Out',
        fields: [
          { name: 'Employee Name', value: employeeName, inline: true },
          { name: 'Time', value: localTime, inline: true },
          { name: 'Duration', value: durationText, inline: true }
        ],
        color: 0xff0000
      }]
    };
    console.log('Sending clock-out webhook:', JSON.stringify(discordData));
    $.