import React from 'react'
import LeadCalculatorPage from '@/views/lead-calculator';
import ComingSoon from '@/components/ComingSoon';
import LeadCalculatorGif from '@/assests/gif/WebsiteLanding.gif';

const LeadCalculator = () => {
  return (
    // <LeadCalculatorPage />
    <ComingSoon gifSrc={LeadCalculatorGif} />
  )
}

export default LeadCalculator;