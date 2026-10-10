/* Configure server endpoints before accepting real submissions. No secrets here.
 * Booking response: {accepted:true}
 * Review response: {accepted:true, moderationStatus:"pending"}
 * The server must validate inputs, rate-limit requests and keep reviews private
 * until an authorised moderator approves them. See DOCTOR_PAGES.md.
 */
window.BreorisDoctorConfig = {
  bookingEndpoint: '',
  reviewEndpoint: '',
  onAnalyticsEvent: null
};
