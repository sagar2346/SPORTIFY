const calculatePrice = async (venue, bookingDate, startTime, endTime) => {
  let price = venue.basePrice;

  // Determine day type
  const dayOfWeek = bookingDate.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const dayType = isWeekend ? 'weekend' : 'weekday';

  // Determine time type (peak hours: 6 PM - 10 PM)
  const hour = parseInt(startTime.split(':')[0]);
  const isPeak = hour >= 18 && hour < 22;
  const timeType = isPeak ? 'peak' : 'off-peak';

  // Apply pricing rules
  if (venue.pricingRules && venue.pricingRules.length > 0) {
    const applicableRule = venue.pricingRules.find(
      (rule) => rule.dayType === dayType && rule.timeType === timeType
    );

    if (applicableRule) {
      price = price * applicableRule.multiplier;
    }
  } else {
    // Default pricing rules
    if (isWeekend) {
      price = price * 1.2; // 20% increase on weekends
    }
    if (isPeak) {
      price = price * 1.3; // 30% increase during peak hours
    }
  }

  return Math.round(price * 100) / 100; // Round to 2 decimal places
};

module.exports = { calculatePrice };

