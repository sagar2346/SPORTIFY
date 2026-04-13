/**
 * Formats a 24h time string (HH:mm) into a 12h AM/PM format.
 * @param {string} timeStr - The time string in HH:mm format.
 * @returns {string} - The formatted time string (e.g., "10:00 AM").
 */
export const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hh = h % 12 || 12;
    return `${hh}:${minutes} ${ampm}`;
};

/**
 * Converts a 12h AM/PM time string back to 24h format.
 * @param {string} timeStr - The time string (e.g., "10:00 AM").
 * @returns {string} - The time string in HH:mm format.
 */
export const to24h = (timeStr) => {
    if (!timeStr) return '';
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    return `${hours < 10 && typeof hours === 'number' ? '0' + hours : hours}:${minutes}`;
};
