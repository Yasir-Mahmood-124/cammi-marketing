
// "use client";
// import React from 'react';
// import { Box, Typography } from '@mui/material';
// import BackgroundImage from '@/assests/images/Background.png';

// const ComingSoon: React.FC = () => {
//   return (
//     <>
//       <Box
//         sx={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           width: '100vw',
//           height: '100vh',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           overflow: 'hidden',
//           backgroundImage: `url(${BackgroundImage.src})`,
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//           backgroundRepeat: 'no-repeat',
//         }}
//       >
//         <Typography
//           sx={{
//             marginLeft: '200px',
//             fontSize: '4rem',
//             fontWeight: 900,
//             letterSpacing: '0.5rem',
//             textAlign: 'center',
//             background: 'linear-gradient(90deg, #FF3C80 0%, #3EA3FF 100%)',
//             WebkitBackgroundClip: 'text',
//             WebkitTextFillColor: 'transparent',
//             backgroundClip: 'text',
//             textTransform: 'uppercase',
//             lineHeight: 1.2,
//           }}
//         >
//           COMING SOON
//         </Typography>
//       </Box>

//       {/* Global style to remove scrollbar */}
//       <style jsx global>{`
//         html,
//         body,
//         #__next {
//           margin: 0 !important;
//           padding: 0 !important;
//           overflow: hidden !important;
//           width: 100% !important;
//           height: 100% !important;
//         }
//       `}</style>
//     </>
//   );
// };

// export default ComingSoon;

"use client";
import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import BackgroundImage from '@/assests/images/Background.png';
import toast, { Toaster } from "react-hot-toast";

interface ComingSoonProps {
  gifSrc: string | { src: string }; // Can accept either a string path or an imported image
}

const ComingSoon: React.FC<ComingSoonProps> = ({ gifSrc }) => {
  const [email, setEmail] = useState('');

  // Handle both string paths and imported images
  const gifUrl = typeof gifSrc === 'string' ? gifSrc : gifSrc.src;

  const handleNotifyMe = () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Success case
    toast.success("Thank you! We'll notify you when we launch");
    setEmail('');
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Box
        sx={{
          width: '100%',
          height: 'calc(100vh - 70px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          backgroundImage: `url(${BackgroundImage.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          padding: { xs: '30px 20px', md: '40px 60px' },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '1200px',
            display: 'flex',
            flexDirection: 'column',
            gap: '60px',
          }}
        >
          {/* Top Section - Coming Soon, Heading, Input with GIF */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: { xs: '30px', md: '60px' },
            }}
          >
            {/* Left Side - Top Content */}
            <Box
              sx={{
                flex: 1,
                maxWidth: '480px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              {/* Coming Soon Tag */}
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 400,
                  color: '#000',
                  letterSpacing: '0.1rem',
                }}
              >
                -COMING SOON
              </Typography>

              {/* Main Heading */}
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: '28px', md: '32px', lg: '36px' },
                    fontWeight: 700,
                    color: '#000',
                    lineHeight: 1.1,
                    marginBottom: '0px',
                  }}
                >
                  Get Notified
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: '28px', md: '32px', lg: '36px' },
                    fontWeight: 700,
                    color: '#000',
                    lineHeight: 1.1,
                  }}
                >
                  When we Launch
                </Typography>
              </Box>

              {/* Email Input and Button */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginTop: '6px',
                  flexWrap: { xs: 'wrap', sm: 'nowrap' },
                }}
              >
                <TextField
                  placeholder="Enter your email"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleNotifyMe();
                    }
                  }}
                  sx={{
                    flex: 1,
                    minWidth: { xs: '100%', sm: '220px' },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '30px',
                      backgroundColor: '#fff',
                      '& fieldset': {
                        borderColor: '#000000',
                        borderWidth: '1px',
                      },
                      '&:hover fieldset': {
                        borderColor: '#000000',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#000000',
                      },
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '12px 20px',
                      color: '#565565',
                      fontWeight: 400,
                      fontSize: '13px',
                      '&::placeholder': {
                        color: '#565565',
                        opacity: 1,
                      },
                    },
                  }}
                />
                <Button
                  onClick={handleNotifyMe}
                  sx={{
                    backgroundColor: '#3EA3FF',
                    color: '#fff',
                    fontWeight: 600,
                    padding: '12px 28px',
                    borderRadius: '30px',
                    textTransform: 'none',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#3EA3FF',
                      color: '#fff',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(62, 163, 255, 0.3)',
                    },
                  }}
                >
                  Notify Me
                </Button>
              </Box>

              {/* Description Text */}
              <Typography
                sx={{
                  fontSize: '13px',
                  fontWeight: 400,
                  color: '#000',
                  lineHeight: 1.6,
                  marginTop: '6px',
                }}
              >
                Are you Ready to get something new from us. Then subscribe the news
                letter to get latest updates
              </Typography>
            </Box>

            {/* Right Side - GIF */}
            <Box
              sx={{
                flex: 1,
                display: { xs: 'none', lg: 'flex' },
                justifyContent: 'center',
                alignItems: 'flex-start',
                maxWidth: '380px',
              }}
            >
              <Box
                component="img"
                src={gifUrl}
                alt="Content Strategy"
                sx={{
                  width: '100%',
                  maxWidth: '350px',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15))',
                }}
              />
            </Box>
          </Box>

          {/* Bottom Section - Additional Info and Button */}
          <Box
            sx={{
              maxWidth: '480px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            {/* Additional Info Text */}
            <Typography
              sx={{
                fontSize: '13px',
                fontWeight: 400,
                color: '#000',
                lineHeight: 1.6,
              }}
            >
              This features is still being built, our experts can walk you through
              anything you need. Just book an appointment using the Calendly link.
            </Typography>

            {/* Book Appointment Button */}
            <Button
              sx={{
                background: 'linear-gradient(90deg, #FF3C81 0%, #3EA3FF 100%)',
                color: '#fff',
                fontWeight: 600,
                padding: '12px 32px',
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '13px',
                alignSelf: 'flex-start',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(90deg, #FF3C81 0%, #3EA3FF 100%)',
                  color: '#fff',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(255, 60, 129, 0.3)',
                },
              }}
            >
              Book Appointment
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ComingSoon;