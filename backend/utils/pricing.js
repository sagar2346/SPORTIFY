const calculatePrice = async (venue, bookingDate, startTime, endTime) => {
  let totalBasePrice = 0;

  // Determine day type (constant for the booking date)
  const dayOfWeek = bookingDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const dayType = isWeekend ? 'weekend' : 'weekday';

  // Parse hours
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = parseInt(endTime.split(':')[0]);
  const durationInHours = endHour - startHour;

  // Calculate price for each hour in the duration
  for (let i = 0; i < durationInHours; i++) {
    const currentHour = startHour + i;
    let hourlyPrice = venue.basePrice;

    // Determine time type for this specific hour (peak hours: 6 PM - 10 PM)
    const isPeak = currentHour >= 18 && currentHour < 22;
    const timeType = isPeak ? 'peak' : 'off-peak';

    // Apply pricing rules for this hour
    if (venue.pricingRules && venue.pricingRules.length > 0) {
      const applicableRule = venue.pricingRules.find(
        (rule) => rule.dayType === dayType && rule.timeType === timeType
      );

      if (applicableRule) {
        hourlyPrice = hourlyPrice * applicableRule.multiplier;
      }
    }

    totalBasePrice += hourlyPrice;
  }

  return Math.round(totalBasePrice * 100) / 100; // Round to 2 decimal places
};

module.exports = { calculatePrice };

