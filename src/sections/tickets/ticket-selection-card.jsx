/* eslint-disable react/prop-types */
import { toast } from 'sonner';
import React, { useRef, useMemo, useState, useEffect, useLayoutEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Stack,
  alpha,
  Grid2,
  Dialog,
  Divider,
  Collapse,
  Typography,
  IconButton,
  DialogTitle,
  ListItemText,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
import { useUserActivity } from 'src/hooks/use-user-activity';

import { useCartStore } from 'src/utils/store';

import { MaterialUISwitch } from 'src/layouts/dashboard/header';

import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';

import useGetCartData from './hooks/use-get-cart';

const TicketSelectionCard = () => {
  const mdDown = useResponsive('down', 'md');
  const ref = useRef();
  const boxRef = useRef();
  const testRef = useRef();
  const isOverflow = useBoolean();
  const isTicketsOverflow = useBoolean();
  const [unavailableTickets, setUnavailableTicket] = useState(null);
  const [addOnInfo, setAddOnInfo] = useState(null);
  const collapse = useBoolean();
  const loading = useBoolean();
  const addOnDialog = useBoolean();
  const settings = useSettingsContext();
  const isActive = useUserActivity();

  const tixs = useCartStore((state) => state.tickets);

  const updateTics = useCartStore((state) => state.updateTickets);

  const updateAddOnQuantity = useCartStore((state) => state.updateAddOnQuantity);

  const { handleCheckout } = useGetCartData();

  const totalTicketsQuantitySelected = useMemo(() => {
    const ticketsTotal = tixs.reduce((acc, cur) => acc + cur.selectedQuantity, 0);
    return ticketsTotal;
  }, [tixs]);

  const subTotal = useMemo(() => {
    const ticketsTotal = tixs.reduce((acc, tix) => acc + tix.selectedQuantity * tix.price, 0);
    const addOnsTotal = tixs.reduce((acc, tix) => {
      const addOnTotal =
        tix.addOns?.reduce(
          (addOnAcc, addOn) => addOnAcc + (addOn.selectedQuantity || 0) * addOn.price,
          0
        ) || 0;
      return acc + addOnTotal;
    }, 0);
    return ticketsTotal + addOnsTotal;
  }, [tixs]);

  const handleOpenAddOn = (ticketId, info) => {
    const existingTicket = tixs.find((item) => item.id === ticketId);
    if (existingTicket.selectedQuantity === 0) {
      toast.warning('Please select at least one ticket first to access add-ons', {
        description: 'Add-ons can only be purchased with tickets',
      });
      return;
    }
    setAddOnInfo({ ...info, selectedQuantity: existingTicket.selectedQuantity, ticketId });
    addOnDialog.onTrue();
  };

  const handleCloseAddOn = () => {
    setAddOnInfo(null);
    addOnDialog.onFalse();
  };

  const tickets = tixs.map((ticket) => {
    if (!ticket) return null;

    const maxPerOrder = ticket?.ticketTypeRequirement?.maximumTicketPerOrder;
    const availableQuantity = ticket.quantity - ticket.sold;
    const selectedQuantity = ticket?.selectedQuantity;

    const maxSelectable = maxPerOrder
      ? Math.min(maxPerOrder, availableQuantity)
      : availableQuantity;

    const isMinusDisabled = selectedQuantity === 0;
    const isPlusDisabled = selectedQuantity === maxSelectable;

    const unavailable = ticket.quantity - ticket.sold === 0;

    return (
      <Grid2
        container
        key={ticket.id}
        sx={{
          minHeight: 67,
          borderRadius: 1.5,
          border: 1,
          borderColor: 'divider',
          p: 2,
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            borderColor: 'black',
            transition: 'linear .3s',
          },
          boxShadow: 1,
          userSelect: 'none',
        }}
        size={{ xs: 12, md: 4 }}
      >
        <Grid2 size={12}>
          <Stack spacing={1}>
            <ListItemText
              primary={ticket.title}
              // secondary={ticket.description}
              slotProps={{
                primary: {
                  fontWeight: 600,
                  letterSpacing: -0.9,
                  fontSize: 20,
                  color: '#00000',
                },
                // secondary: {
                //   variant: 'caption',
                //   fontWeight: 500,
                //   fontSize: 14,
                //   letterSpacing: -0.9,
                //   color: '#606060',
                //   maxWidth: 300,
                //   whiteSpace: 'pretty',
                // },
              }}
            />
            <Typography
              component="div"
              dangerouslySetInnerHTML={{
                __html: ticket.description.replace(/\n/g, '<br />'),
              }}
              sx={{
                variant: 'caption',
                fontWeight: 500,
                fontSize: 14,
                letterSpacing: -0.9,
                color: '#606060',
                maxWidth: 300,
                whiteSpace: 'pretty',
              }}
            />
          </Stack>
        </Grid2>

        <Grid2 size={12} alignContent="flex-end">
          <Stack direction="row" flexWrap="wrap" spacing={1}>
            <ListItemText
              primary="Price"
              secondary={Intl.NumberFormat('en-MY', {
                style: 'currency',
                currency: 'MYR',
              }).format(ticket.price)}
              slotProps={{
                primary: {
                  fontWeight: 600,
                  letterSpacing: -0.9,
                  fontSize: 18,
                  color: '#00000',
                },
                secondary: {
                  mt: -0.5,
                  fontWeight: 600,
                  letterSpacing: -0.9,
                  fontSize: 17,
                  color: '#00000',
                },
              }}
            />
            {unavailable ? (
              <Typography variant="subtitle2" color="text.secondary" alignSelf="center">
                Sold out
              </Typography>
            ) : (
              <Stack direction="row" alignItems="center" spacing={2} justifyContent="end">
                <IconButton
                  sx={{
                    bgcolor: '#00564B',
                    '&:hover': { bgcolor: '#00564B99' },
                    borderRadius: 1,
                    ...(isMinusDisabled && {
                      pointerEvents: 'none',
                      bgcolor: '#D9D9D9',
                    }),
                  }}
                  onClick={() =>
                    updateTics(ticket.id, {
                      selectedQuantity:
                        ticket.selectedQuantity < 1 ? 0 : ticket.selectedQuantity - 1,
                      subTotal: ticket.selectedQuantity * ticket.price,
                    })
                  }
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(1px)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Iconify
                    icon="ic:round-minus"
                    width={15}
                    color={isMinusDisabled ? '#676767' : 'white'}
                  />
                </IconButton>
                <Typography variant="subtitle1">{ticket.selectedQuantity}</Typography>
                <IconButton
                  sx={{
                    bgcolor: '#00564B',
                    borderRadius: 1,
                    '&:hover': { bgcolor: '#00564B99' },
                    ...(isPlusDisabled && {
                      pointerEvents: 'none',
                      bgcolor: '#D9D9D9',
                    }),
                  }}
                  onClick={(e) =>
                    updateTics(
                      ticket.id,
                      ticket?.ticketTypeRequirement?.maximumTicketPerOrder
                        ? {
                            selectedQuantity:
                              ticket.selectedQuantity <
                              ticket?.ticketTypeRequirement?.maximumTicketPerOrder
                                ? ticket.selectedQuantity + 1
                                : ticket?.ticketTypeRequirement?.maximumTicketPerOrder,
                            subTotal: ticket.selectedQuantity * ticket.price,
                          }
                        : {
                            selectedQuantity: ticket.selectedQuantity + 1,
                            subTotal: ticket.selectedQuantity * ticket.price,
                          }
                    )
                  }
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(1px)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Iconify
                    icon="material-symbols:add-rounded"
                    width={15}
                    color={isPlusDisabled ? '#676767' : 'white'}
                  />
                </IconButton>
              </Stack>
            )}
          </Stack>
        </Grid2>

        {!!ticket?.addOns?.length && (
          <Grid2 size={12} alignContent="flex-end">
            <Stack spacing={1.5} mt={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Iconify 
                    icon="material-symbols:add-shopping-cart-outline" 
                    width={14} 
                    color="text.secondary"
                  />
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    Add Ons Available:
                  </Typography>
                </Stack>
                  {ticket.selectedQuantity === 0 ? (
                   <Typography 
                     variant="caption" 
                     sx={{ 
                       color: 'warning.main',
                       fontStyle: 'italic',
                       fontSize: 11,
                       display: 'flex',
                       alignItems: 'center',
                       gap: 0.5,
                       whiteSpace: 'nowrap',
                       flexShrink: 0,
                     }}
                   >
                     <Iconify icon="material-symbols:info-outline" width={12} />
                     Select a ticket first to include add-ons
                   </Typography>
                ) : (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'success.main',
                      fontStyle: 'italic',
                      fontSize: 11,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Iconify icon="material-symbols:check-circle-outline" width={12} />
                    {ticket.selectedQuantity} ticket{ticket.selectedQuantity > 1 ? 's' : ''} selected
                  </Typography>
                )}
              </Stack>

              <Stack 
                direction="row" 
                spacing={0.5} 
                sx={{ 
                  scrollbarWidth: 'thin',
                  transition: 'all 0.3s ease-in-out',
                  pt: 1.5,
                  pb: 0.5, 
                  overflowX: 'auto',
                  overflowY: 'hidden', 
                  justifyContent: 'flex-start', 
                }}
              >
                {ticket.addOns.map((item) => {
                  const isAddOnDisabled = ticket.selectedQuantity === 0;
                  const isAddOnSelected = item?.selectedQuantity > 0;

                  return (
                    <Box
                      key={item.id}
                      sx={(theme) => {
                        let bgcolor;
                        if (isAddOnSelected) {
                          bgcolor = 'success.lighter';
                        } else if (theme.palette.mode === 'light') {
                          bgcolor = 'common.black';
                        } else {
                          bgcolor = 'grey.800';
                        }

                        return {
                          p: 1.5,
                          position: 'relative',
                          borderRadius: 1.5,
                          border: 1,
                          borderColor: 'divider',
                          minWidth: 160,
                          userSelect: 'none',
                          transition: 'all 0.2s ease-in-out',
                          my: 0.5,
                          mr: 1,
                          bgcolor,
                          ...(isAddOnSelected && {
                            borderColor: 'success.main',
                          }),
                          ...(isAddOnDisabled && {
                            cursor: 'not-allowed',
                          }),
                        };
                      }}
                    >
                      {/* Selection Indicator */}
                      {!!item?.selectedQuantity && (
                        <Box
                          sx={{
                            borderRadius: '50%',
                            width: 26,
                            height: 26,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'absolute',
                            right: -10,
                            top: -8,
                            bgcolor: 'success.main',
                            color: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            zIndex: 100,
                            border: '2px solid white',
                          }}
                        >
                          <Iconify icon="material-symbols:check-rounded" width={16} />
                        </Box>
                      )}

                      <Stack spacing={1}>
                        <ListItemText
                          primary={item.name}
                          secondary={item.description}
                          slotProps={{
                            primary: {
                              fontWeight: 600,
                              letterSpacing: -0.5,
                              fontSize: 13,
                              color: isAddOnSelected ? 'text.primary' : 'common.white',
                              mb: -0.2,
                              noWrap: true,
                            },
                            secondary: {
                              variant: 'caption',
                              fontWeight: 400,
                              fontSize: 11,
                              letterSpacing: -0.3,
                              color: isAddOnSelected ? 'text.secondary' : 'grey.400',
                              sx: {
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                minHeight: 30, // to prevent layout shift
                              },
                            },
                          }}
                        />
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mt: 0.5 }}
                        >
                          <Typography
                            fontWeight={600}
                            fontSize={12}
                            color={isAddOnSelected ? 'success.main' : 'common.white'}
                          >
                            {Intl.NumberFormat('en-MY', {
                              style: 'currency',
                              currency: 'MYR',
                            }).format(item.price)}
                          </Typography>
                          <IconButton
                            size="small"
                            disabled={isAddOnDisabled}
                            onClick={() => {
                              if (isAddOnDisabled) return;
                              handleOpenAddOn(ticket.id, item);
                            }}
                            sx={(theme) => ({
                              bgcolor: '#00564B',
                              borderRadius: 1,
                              border: '1px solid transparent',
                              color: 'white',
                              '&:hover': { bgcolor: '#00564B99' },
                              '&.Mui-disabled': {
                                bgcolor: alpha(theme.palette.common.white, 0.08),
                                borderColor: alpha(theme.palette.common.white, 0.16),
                                color: theme.palette.grey[600],
                              },
                            })}
                          >
                            <Iconify icon="material-symbols:add-rounded" width={15} />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </Stack>
          </Grid2>
        )}
      </Grid2>
    );
  });

  useEffect(() => {
    const el = ref?.current;
    if (!el) return;
    if (!ref.current) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = ref.current;
      if (scrollTop + clientHeight >= scrollHeight) {
        isOverflow.onFalse();
      } else {
        isOverflow.onTrue();
      }
    };

    handleScroll();

    el.addEventListener('scroll', handleScroll);

    // eslint-disable-next-line consistent-return
    return () => {
      if (el) {
        el.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isOverflow]);

  const scrollToTop = () => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = 0;
  };

  useLayoutEffect(() => {
    if (!testRef.current || !ref.current) return;

    const { clientHeight } = ref.current;
    const { scrollHeight } = testRef.current;

    if (scrollHeight >= clientHeight) {
      isTicketsOverflow.onTrue();
    } else {
      isTicketsOverflow.onFalse();
    }
  }, [isTicketsOverflow]);

  useLayoutEffect(() => {
    if (!boxRef.current) return;
    const overviewBox = boxRef.current;

    const handleClick = (event) => {
      if (!overviewBox.contains(event.target)) {
        collapse.onFalse();
      }
    };

    document.addEventListener('click', handleClick);

    // eslint-disable-next-line consistent-return
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [collapse]);

  return (
    <Box
      sx={{
        height: 1,
        p: 2,
        ml: 0.5,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <ListItemText
        primary="Event Ticket"
        secondary="Choose from our available tickets, including Standard and Early Bird options. Select your quantity and secure your spot today!"
        primaryTypographyProps={{ variant: 'subtitle1' }}
        secondaryTypographyProps={{ variant: 'caption' }}
      />

      <Box position="absolute" right={0} zIndex={1111} top={5}>
        <MaterialUISwitch
          sx={{ m: 1, opacity: isActive ? 1 : 0.2, transition: 'all linear .2s' }}
          checked={settings.themeMode !== 'light'}
          onChange={() =>
            settings.onUpdate('themeMode', settings.themeMode === 'light' ? 'dark' : 'light')
          }
        />
      </Box>

      <Box
        ref={ref}
        flexGrow={1}
        sx={{
          ...(mdDown ? { maxHeight: 'calc(100vh - 280px)' } : { height: 1 }),
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'thin',
          scrollBehavior: 'smooth',
          transition: 'all ease-in-out .3s',
          transitionTimingFunction: 'linear',
        }}
      >
        {loading.value ? (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <CircularProgress
              thickness={5}
              size={100}
              sx={{
                color: (theme) => theme.palette.common.black,
                strokeLinecap: 'round',
              }}
            />
          </Box>
        ) : (
          <Grid2 container my={2} spacing={1.5} ref={testRef}>
            {tickets}
          </Grid2>
        )}

        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            bottom: 20,
            display: (!isTicketsOverflow.value || isOverflow.value) && 'none',
            right: 10,
            bgcolor: 'black',
            color: 'whitesmoke',
            '&.MuiIconButton-root': {
              '&:hover': {
                bgcolor: alpha('#000000', 0.8),
              },
            },
          }}
          onClick={scrollToTop}
        >
          <Iconify icon="raphael:arrowup" width={22} />
        </IconButton>
      </Box>

      {mdDown && (
        <Box
          ref={boxRef}
          mt="auto"
          p={1}
          boxShadow={10}
          sx={{
            borderTop: 1.5,
            borderColor: (theme) => theme.palette.divider,
          }}
          position="fixed"
          width={1}
          left={0}
          bottom={0}
          zIndex={1111}
          component={Card}
        >
          <Collapse in={collapse.value} timeout="auto">
            <Box sx={{ height: '40vh', p: 1 }} position="relative">
              {!totalTicketsQuantitySelected ? (
                <Typography
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                  color="text.secondary"
                >
                  No tickets selected
                </Typography>
              ) : (
                <Stack height={1}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="subtitle2">Order Summary</Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        collapse.onFalse();
                      }}
                    >
                      <Iconify icon="iconamoon:arrow-up-2-bold" width={20} />
                    </IconButton>
                  </Stack>
                  <Stack
                    spacing={1}
                    flexGrow={1}
                    sx={{
                      overflowY: 'auto',
                      maxHeight: '25vh',
                      '& .MuiTypography-root': {
                        fontSize: 16,
                        fontWeight: 500,
                      },
                    }}
                  >
                    {/* Tickets */}
                    {tixs
                      .filter((ticket) => ticket.selectedQuantity > 0)
                      .map((ticket) => (
                        <Stack key={ticket.id} spacing={0.5}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Typography>{`${ticket.selectedQuantity} x ${ticket.title}`}</Typography>
                            <Typography>
                              {Intl.NumberFormat('en-MY', {
                                style: 'currency',
                                currency: 'MYR',
                              }).format(ticket.selectedQuantity * ticket.price)}
                            </Typography>
                          </Stack>
                          
                          {/* Add-ons for this ticket */}
                          {ticket.addOns?.filter(addOn => addOn.selectedQuantity > 0).map((addOn) => (
                            <Stack
                              key={addOn.id}
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                              sx={{ pl: 2 }}
                            >
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ fontSize: 14 }}
                              >
                                {`+ ${addOn.selectedQuantity} x ${addOn.name}`}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{ fontSize: 14 }}
                              >
                                {Intl.NumberFormat('en-MY', {
                                  style: 'currency',
                                  currency: 'MYR',
                                }).format(addOn.selectedQuantity * addOn.price)}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      ))}
                  </Stack>
                  <Stack spacing={2}>
                    {/* <Stack
                      direction="row"
                      alignItems="center"
                      gap={10}
                      justifyContent="space-between"
                      sx={{
                        '& .MuiTypography-root': {
                          fontSize: 16,
                          fontWeight: 500,
                        },
                      }}
                    >
                      <Typography>SST:</Typography>
                      <Typography>
                        {Intl.NumberFormat('en-MY', {
                          style: 'currency',
                          currency: 'MYR',
                        }).format(0.1)}
                      </Typography>
                    </Stack> */}
                    <Divider />
                    <Stack
                      direction="row"
                      alignItems="center"
                      gap={10}
                      justifyContent="space-between"
                      sx={{
                        '&  .MuiTypography-root': {
                          fontSize: 20,
                          fontWeight: 600,
                        },
                      }}
                    >
                      <Typography>Total:</Typography>
                      <Typography>
                        {Intl.NumberFormat('en-MY', {
                          style: 'currency',
                          currency: 'MYR',
                        }).format(subTotal || 0)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              )}
            </Box>
          </Collapse>

          <Box my={1} onClick={() => collapse.onToggle()}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 2 }}
            >
              {!collapse.value && (
                <Typography variant="subtitle1" fontSize={18} fontWeight={600} letterSpacing={-0.7}>
                  Total
                </Typography>
              )}
              <Box
                sx={{ position: 'absolute', left: '50%', top: -10, transform: 'translateX(-50%)' }}
              >
                <Iconify
                  icon="fluent:line-horizontal-1-20-filled"
                  width={50}
                  color="text.secondary"
                />
              </Box>
              <Stack direction="row" alignItems="center" spacing={2}>
                {!collapse.value && (
                  <Typography
                    variant="subtitle1"
                    textAlign="end"
                    fontSize={18}
                    fontWeight={600}
                    letterSpacing={-0.7}
                  >
                    {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
                      subTotal || 0
                    )}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Box>

          <LoadingButton
            size="large"
            variant="contained"
            fullWidth
            loading={loading.value}
            onClick={handleCheckout}
            disabled={!totalTicketsQuantitySelected}
            startIcon={
              <Iconify icon="material-symbols-light:shopping-cart-checkout-rounded" width={22} />
            }
          >
            Next
          </LoadingButton>
        </Box>
      )}

      <AddOnDialog
        addOnDialog={addOnDialog}
        handleCloseAddOn={handleCloseAddOn}
        addOnInfo={addOnInfo}
        tixs={tixs}
        updateAddOnQuantity={updateAddOnQuantity}
      />
    </Box>
  );
};

export default TicketSelectionCard;

const AddOnDialog = ({ addOnDialog, handleCloseAddOn, addOnInfo, tixs, updateAddOnQuantity }) => {
  const currentAddOn = useMemo(
    () =>
      tixs?.find((a) => a.id === addOnInfo?.ticketId)?.addOns.find((b) => b.id === addOnInfo?.id) ||
      0,
    [tixs, addOnInfo]
  );

  const totalSelectedQuantity = useMemo(
    () =>
      tixs
        ?.find((a) => a.id === addOnInfo?.ticketId)
        ?.addOns?.reduce((acc, curr) => acc + (curr?.selectedQuantity || 0), 0) || 0,
    [tixs, addOnInfo]
  );

  const selectedQuantity = currentAddOn?.selectedQuantity || 0;

  return (
    <Dialog
      open={addOnDialog.value}
      onClose={handleCloseAddOn}
      PaperProps={{
        sx: { borderRadius: 0.5 },
      }}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {addOnInfo?.name || ''}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
          {addOnInfo?.description || ''}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 0, pb: 1 }}>
        <Stack spacing={2}>
          {/* Price and Quantity Section */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack>
              <Typography variant="h6" fontWeight={600} color="primary.main">
                {Intl.NumberFormat('en-MY', {
                  style: 'currency',
                  currency: 'MYR',
                }).format(addOnInfo?.price || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                per add-on
              </Typography>
            </Stack>

            {/* Quantity Controls */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <IconButton
                size="small"
                sx={{
                  bgcolor: selectedQuantity === 0 ? 'grey.200' : 'primary.main',
                  '&:hover': { 
                    bgcolor: selectedQuantity === 0 ? 'grey.200' : 'primary.dark' 
                  },
                  width: 36,
                  height: 36,
                  ...(selectedQuantity === 0 && {
                    pointerEvents: 'none',
                  }),
                }}
                onClick={() => {
                  if (selectedQuantity === 0) return;
                  updateAddOnQuantity(addOnInfo?.ticketId, addOnInfo?.id, 'decrement');
                }}
              >
                <Iconify 
                  icon="ic:round-minus" 
                  width={18} 
                  color={selectedQuantity === 0 ? 'grey.500' : 'white'} 
                />
              </IconButton>
              
              <Typography variant="h6" fontWeight={600} sx={{ minWidth: 30, textAlign: 'center' }}>
                {selectedQuantity}
              </Typography>
              
              <IconButton
                size="small"
                sx={{
                  bgcolor: (totalSelectedQuantity >= addOnInfo?.selectedQuantity) ? 'grey.200' : 'primary.main',
                  '&:hover': { 
                    bgcolor: (totalSelectedQuantity >= addOnInfo?.selectedQuantity) ? 'grey.200' : 'primary.dark' 
                  },
                  width: 36,
                  height: 36,
                  ...((totalSelectedQuantity >= addOnInfo?.selectedQuantity) && {
                    pointerEvents: 'none',
                  }),
                }}
                onClick={() => {
                  updateAddOnQuantity(addOnInfo?.ticketId, addOnInfo?.id, 'increment');
                }}
              >
                <Iconify 
                  icon="material-symbols:add-rounded" 
                  width={18} 
                  color={(totalSelectedQuantity >= addOnInfo?.selectedQuantity) ? 'grey.500' : 'white'} 
                />
              </IconButton>
            </Stack>
          </Stack>

          {/* Availability Info - Compact */}
          <Typography variant="caption" color="text.secondary" textAlign="center">
            Available for {addOnInfo?.selectedQuantity} x {tixs?.find((a) => a.id === addOnInfo?.ticketId)?.title || 'ticket'}
          </Typography>

          {/* Subtotal - Only show if selected */}
          {selectedQuantity > 0 && (
            <Stack 
              direction="row" 
              alignItems="center" 
              justifyContent="space-between"
              sx={{
                p: 1.5,
                bgcolor: 'primary.lighter',
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                Total
              </Typography>
              <Typography variant="body1" fontWeight={600} color="primary.main">
                {Intl.NumberFormat('en-MY', {
                  style: 'currency',
                  currency: 'MYR',
                }).format((addOnInfo?.price || 0) * selectedQuantity)}
              </Typography>
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <LoadingButton
          variant="contained"
          onClick={handleCloseAddOn}
          fullWidth
          sx={{
            py: 1,
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
          startIcon={<Iconify icon="material-symbols:check-rounded" width={18} />}
        >
          Done
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};
