import useSWR from 'swr';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useFieldArray, useFormContext } from 'react-hook-form';
import React, { useRef, useMemo, useState, useEffect, useLayoutEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Stack,
  alpha,
  Button,
  Divider,
  Tooltip,
  MenuItem,
  Collapse,
  TextField,
  Typography,
  IconButton,
  ListItemText,
  CircularProgress,
} from '@mui/material';

import { useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';

import axiosInstance, { fetcher, endpoints } from 'src/utils/axios';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { RHFSelect, RHFCheckbox } from 'src/components/hook-form';

import useGetCartData from './hooks/use-get-cart';
import { TextFieldCustom } from './components/text-field';

const defaultAttendee = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  company: '',
  isForbuyer: false,
};

const TicketInformationCard = () => {
  const collapse = useBoolean();
  const anotherCollapse = useBoolean();
  const [collapseAttendees, setCollapseAttendees] = useState([]);
  const ref = useRef();
  const mdDown = useResponsive('down', 'md');
  const [discountCode, setDiscountCode] = useState(null);
  const boxRef = useRef();
  const cartSessionId = localStorage.getItem('cartSessionId');
  const searchParams = useSearchParams();
  const isOverflow = useBoolean();
  const [activeFieldId, setActiveFieldId] = useState(null);
  const { cartMutate } = useGetCartData();

  const [lastRemoved, setLastRemoved] = useState(null);

  const { data, isLoading: cartLoading, mutate } = useSWR(`/api/cart/${cartSessionId}`, fetcher);

  const isCartExpired = useMemo(() => dayjs(data?.expiryDate).isBefore(dayjs(), 'date'), [data]);

  const ticketTypes = useMemo(() => data?.cartItem, [data]);

  const handleRedeemDiscount = async () => {
    if (!discountCode) {
      toast.error('Please enter a discount code');
      return;
    }

    try {
      const res = await axiosInstance.post('/api/cart/redeemDiscountCode', { discountCode });
      toast.success(res?.data?.message);
      mutate();
    } catch (error) {
      toast.error(error);
    }
  };

  const subTotal = useMemo(
    () => data?.cartItem?.reduce((acc, sum) => acc + sum.quantity * sum.ticketType.price, 0),
    [data]
  );

  const { watch, control, setValue, getValues } = useFormContext();

  const buyer = watch('buyer.isAnAttendee');

  const toggleCollapse = (index) => {
    setCollapseAttendees((prev) =>
      prev.includes(index) ? prev.filter((val) => val !== index) : [...prev, index]
    );
  };

  const { fields, update } = useFieldArray({
    control,
    name: 'attendees',
  });

  const handleChangeTicket = (value) => {
    setValue('buyer.ticket', value);
    const buyerInfo = getValues('buyer');

    const attendees = getValues('attendees');

    const newAttendees = [...attendees];

    if (buyer) {
      const existingTagIndex = newAttendees.findIndex((item) => item.isForbuyer);
      const existingValue = newAttendees[existingTagIndex];

      if (existingTagIndex !== -1) {
        update(existingTagIndex, {
          ...defaultAttendee,
          ticket: existingValue.ticket,
        });
        setLastRemoved(null); // Reset last removed after restoring
      }

      const index = newAttendees.findIndex((attendee) => attendee.ticket.id === value);

      const val = {
        firstName: buyerInfo.firstName || '',
        lastName: buyerInfo.lastName || '',
        email: buyerInfo.email || '',
        phoneNumber: buyerInfo.phoneNumber || '',
        company: buyerInfo.company || '',
        ticket: newAttendees[index].ticket,
        addOn: newAttendees[index]?.addOn || null,
      };

      if (index !== -1) {
        update(index, { ...val, isForbuyer: true });
      }
    }
  };

  const handleBuyerCheckbox = (val) => {
    setValue('buyer.isAnAttendee', val);
    const attendees = getValues('attendees');

    if (!val) {
      setValue('buyer.ticket', '');
      const latestAttendeeesInfo = attendees.map((item) =>
        item.isForbuyer
          ? { ...defaultAttendee, ticket: item.ticket, addOn: item.addOn }
          : { ...item, isForbuyer: false }
      );

      setValue('attendees', latestAttendeeesInfo);
    }
  };

  const onChangeInputBuyer = (e) => {
    const { name, value } = e.target;

    const attendees = getValues('attendees');
    const index = attendees.findIndex((i) => i.isForbuyer);

    if (index !== -1) {
      const updatedAttendee = { ...attendees[index] };

      if (name === 'buyer.firstName') updatedAttendee.firstName = value;
      if (name === 'buyer.lastName') updatedAttendee.lastName = value;
      if (name === 'buyer.email') updatedAttendee.email = value;
      if (name === 'buyer.phoneNumber') updatedAttendee.phoneNumber = value;
      if (name === 'buyer.company') updatedAttendee.company = value;

      update(index, { ...updatedAttendee, ticket: updatedAttendee.ticket });
    }

    const buyerData = JSON.parse(localStorage.getItem('buyer')) || {};

    const buyerInfo = {
      ...buyerData,
      [name.split('.')[1]]: value,
    };

    localStorage.setItem('buyer', JSON.stringify(buyerInfo));

    setValue(name, value, { shouldValidate: true });
  };

  const copyCompanyName = () => {
    const companyName = getValues('buyer.company');
    fields.forEach((field, index) => {
      setValue(`attendees.${index}.company`, companyName, { shouldValidate: true });
    });
  };

  const removeTicket = async (item, index) => {
    const attendees = JSON.parse(localStorage.getItem('attendees'));

    if (attendees.length > index) {
      attendees.splice(index, 1); // Remove item at the specified index
      localStorage.setItem('attendees', JSON.stringify(attendees));
    }

    // Ensure that attendees is empty before removing from localStorage
    if (attendees.length === 0) {
      localStorage.removeItem('attendees');
    }

    try {
      const ticket = data.cartItem.find((a) => a.ticketType.id === item);
      const res = await axiosInstance.post(endpoints.cart.removeTicket, { ticket });
      mutate(`/api/cart/${cartSessionId}`);
      cartMutate();
      toast.success(res?.data?.message);
    } catch (error) {
      toast.error('Failed to remove');
    }
  };

  const isAttendeeInfoComplete = (attendee, index) => {
    if (!attendee) return false;

    const attendeeValues = watch(`attendees.${index}`);

    const requiredFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'company'];
    return requiredFields.every(
      (field) => attendeeValues && attendeeValues[field] && attendeeValues[field].trim() !== ''
    );
  };

  const buyerInfo = (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        mb: 2.5,
        overflow: 'visible',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        onMouseDown={(e) => {
          e.currentTarget.style.position = 'relative';
          e.currentTarget.style.top = '1px';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.position = '';
        }}
        onClick={(e) => {
          e.stopPropagation();
          collapse.onToggle();
        }}
        sx={{
          cursor: 'pointer',
          p: 2,
          borderRadius: '16px 16px 0 0',
          transition: 'all 0.2s ease',
          bgcolor: (theme) => alpha(theme.palette.grey[200], 0.5),
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Iconify icon="mdi:account-outline" width={20} />
          <Typography variant="subtitle1" fontWeight={500}>
            Buyer&apos;s Information
          </Typography>
        </Stack>
        <IconButton
          size="small"
          sx={{
            transition: 'transform 0.2s ease',
            transform: collapse.value ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <Iconify icon="ep:arrow-down-bold" width={18} />
        </IconButton>
      </Stack>

      <Collapse in={collapse.value} timeout="auto" unmountOnExit>
        <Box sx={{ p: 2.5, pt: 2 }}>
          <Box
            display="grid"
            gridTemplateColumns={{ xs: 'repeat(1,1fr)', md: 'repeat(2,1fr)' }}
            gap={2}
          >
            <TextFieldCustom
              name="buyer.firstName"
              label="First Name"
              onChange={onChangeInputBuyer}
            />
            <TextFieldCustom
              name="buyer.lastName"
              label="Last Name"
              onChange={onChangeInputBuyer}
            />
            <TextFieldCustom name="buyer.email" label="Email" onChange={onChangeInputBuyer} />
            <TextFieldCustom
              name="buyer.phoneNumber"
              label="Phone Number"
              inputMode="decimal"
              onChange={onChangeInputBuyer}
            />
            <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
              <TextFieldCustom
                name="buyer.company"
                label="Company"
                onChange={onChangeInputBuyer}
                sx={{ width: '100%' }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={copyCompanyName}
                sx={{
                  height: 36,
                  minWidth: 70,
                  ml: 1,
                  borderRadius: 1,
                  borderColor: 'grey.400',
                  color: 'grey.700',
                  fontSize: '0.8rem',
                  '&:hover': {
                    borderColor: 'grey.600',
                    bgcolor: 'grey.100',
                  },
                }}
              >
                Copy
              </Button>
            </Stack>
            {buyer && (
              <Box sx={{ width: '100%' }}>
                <Typography
                  variant="body2"
                  component="label"
                  htmlFor="buyer-ticket"
                  sx={{
                    mb: 0.75,
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: 'text.secondary',
                  }}
                >
                  For which ticket?
                </Typography>
                <RHFSelect
                  name="buyer.ticket"
                  id="buyer-ticket"
                  onChange={(e) => handleChangeTicket(e.target.value)}
                  sx={{
                    '& .MuiInputBase-root': {
                      '& fieldset': {
                        borderColor: (theme) => alpha(theme.palette.text.primary, 0.2),
                      },
                      borderRadius: 1,
                      fontSize: '0.9rem',
                    },
                    '& .MuiOutlinedInput-input': {
                      padding: '12px 14px',
                    },
                  }}
                >
                  {ticketTypes?.map((ticket) => (
                    <MenuItem key={ticket.id} value={ticket.ticketType.id}>
                      {ticket.ticketType.title}
                    </MenuItem>
                  ))}
                </RHFSelect>
              </Box>
            )}
          </Box>

          <Stack
            spacing={1}
            sx={{
              mt: 2.5,
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: (theme) => alpha(theme.palette.grey[200], 0.6),
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="material-symbols:mail-outline" width={18} color="grey.700" />
              <Typography variant="body2" fontSize="0.85rem">
                Your ticket(s) will be sent to your provided email address.
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Iconify icon="ic:baseline-whatsapp" width={18} color="grey.700" />
              <Typography variant="body2" fontSize="0.85rem">
                Information regarding the event will be sent to your WhatsApp.
              </Typography>
            </Stack>
          </Stack>

          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <RHFCheckbox
              name="buyer.isAnAttendee"
              label="I am also an attendee"
              onChange={(_, val) => handleBuyerCheckbox(val)}
              sx={{
                '& .MuiCheckbox-root': {
                  padding: '4px',
                  color: (theme) => theme.palette.grey[600],
                  '&.Mui-checked': {
                    color: (theme) => theme.palette.grey[800],
                  },
                },
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.85rem',
                },
              }}
            />
          </Box>
        </Box>
      </Collapse>
    </Card>
  );

  const attendeeinfo = (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        mb: 2.5,
        overflow: 'visible',
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{
          borderRadius: '16px 16px 0 0',
          p: 2,
          bgcolor: (theme) => alpha(theme.palette.grey[200], 0.5),
        }}
      >
        <Iconify icon="mdi:account-group-outline" width={20} />
        <Typography variant="subtitle1" fontWeight={500}>
          Attendee&apos;s Information
        </Typography>
      </Stack>

      <Box sx={{ p: 2 }}>
        <Stack spacing={2}>
          {fields.map((field, index) => (
            <Card
              key={field.id}
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                overflow: 'hidden',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: (theme) => alpha(theme.palette.grey[700], 0.3),
                  boxShadow: (theme) => `0 0 0 1px ${alpha(theme.palette.grey[500], 0.2)}`,
                },
              }}
            >
              <Stack
                id={field.id}
                component="div"
                onMouseDown={(e) => {
                  e.currentTarget.style.position = 'relative';
                  e.currentTarget.style.top = '1px';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.position = '';
                }}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCollapse(index);
                }}
                sx={{
                  cursor: 'pointer',
                  p: 1.75,
                  transition: 'all 0.2s ease',
                  bgcolor: collapseAttendees.includes(index)
                    ? (theme) => alpha(theme.palette.grey[300], 0.5)
                    : 'transparent',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                  {/* Attendee completion status indicator */}
                  <Tooltip
                    title={
                      isAttendeeInfoComplete(field, index)
                        ? 'Information complete'
                        : 'Information incomplete'
                    }
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 0.5 }}>
                      {isAttendeeInfoComplete(field, index) ? (
                        <Iconify
                          icon="mdi:check-circle"
                          width={16}
                          sx={{
                            color: 'success.main',
                          }}
                        />
                      ) : (
                        <Iconify
                          icon="mdi:alert-circle-outline"
                          width={16}
                          sx={{
                            color: 'warning.main',
                          }}
                        />
                      )}
                    </Box>
                  </Tooltip>

                  <Typography
                    variant="subtitle2"
                    color={collapseAttendees.includes(index) ? 'grey.800' : 'text.secondary'}
                    sx={{ fontWeight: 500 }}
                  >
                    Attendee {index + 1}
                  </Typography>

                  <Stack
                    direction="row"
                    alignItems="center"
                    flexWrap="wrap"
                    spacing={0.75}
                    sx={{ ml: 0.5 }}
                  >
                    <Label
                      color="info"
                      sx={{
                        borderRadius: '4px',
                        py: 0.5,
                        height: 22,
                        fontSize: '0.7rem',
                      }}
                    >
                      <Iconify icon="mingcute:ticket-line" width={14} sx={{ mr: 0.5 }} />
                      {field.ticket.title}
                    </Label>
                    {field.isForbuyer && (
                      <Label
                        color="success"
                        sx={{
                          borderRadius: '4px',
                          py: 0.5,
                          height: 22,
                          fontSize: '0.7rem',
                        }}
                      >
                        Buyer&apos;s ticket
                      </Label>
                    )}
                    {field.addOn && (
                      <Label
                        color="warning"
                        sx={{
                          borderRadius: '4px',
                          py: 0.5,
                          height: 22,
                          fontSize: '0.7rem',
                        }}
                      >
                        <Iconify icon="icon-park-solid:add-one" width={12} sx={{ mr: 0.5 }} />
                        Add On - {field?.addOn?.addOn?.name}
                      </Label>
                    )}
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={0.75}>
                  <Tooltip title="Remove ticket">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTicket(field.ticket.id, index);
                      }}
                      sx={{
                        bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                        '&:hover': {
                          bgcolor: (theme) => alpha(theme.palette.error.main, 0.2),
                        },
                      }}
                    >
                      <Iconify icon="mdi:trash" width={16} />
                    </IconButton>
                  </Tooltip>

                  <IconButton
                    size="small"
                    sx={{
                      transition: 'transform 0.2s ease',
                      transform: collapseAttendees.includes(index)
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                    }}
                  >
                    <Iconify icon="ep:arrow-down-bold" width={16} />
                  </IconButton>
                </Stack>
              </Stack>

              <Collapse in={collapseAttendees.includes(index)} timeout="auto" unmountOnExit>
                <Box sx={{ px: 2, pb: 2 }}>
                  <Box
                    display="grid"
                    gridTemplateColumns={{ xs: 'repeat(1,1fr)', md: 'repeat(2,1fr)' }}
                    gap={2}
                    sx={{ mt: 2 }}
                  >
                    <TextFieldCustom
                      name={`attendees.${index}.firstName`}
                      label="First Name"
                      slotProps={
                        getValues(`attendees.${index}.isForbuyer`) && {
                          input: {
                            readOnly: true,
                          },
                        }
                      }
                    />
                    <TextFieldCustom
                      name={`attendees.${index}.lastName`}
                      label="Last Name"
                      slotProps={
                        getValues(`attendees.${index}.isForbuyer`) && {
                          input: {
                            readOnly: true,
                          },
                        }
                      }
                    />
                    <TextFieldCustom
                      name={`attendees.${index}.email`}
                      label="Email"
                      slotProps={
                        getValues(`attendees.${index}.isForbuyer`) && {
                          input: {
                            readOnly: true,
                          },
                        }
                      }
                    />
                    <TextFieldCustom
                      name={`attendees.${index}.phoneNumber`}
                      label="Phone Number"
                      inputMode="decimal"
                      slotProps={
                        getValues(`attendees.${index}.isForbuyer`) && {
                          input: {
                            readOnly: true,
                          },
                        }
                      }
                    />
                    <TextFieldCustom
                      name={`attendees.${index}.company`}
                      label="Company"
                      slotProps={
                        getValues(`attendees.${index}.isForbuyer`) && {
                          input: {
                            readOnly: true,
                          },
                        }
                      }
                    />
                  </Box>
                </Box>
              </Collapse>
            </Card>
          ))}
        </Stack>
      </Box>
    </Card>
  );

  const scrollToTop = () => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = 0;
  };

  useEffect(() => {
    if (!data?.cartItem?.length) return;

    // Load existing attendees from localStorage
    const storedAttendees = localStorage.getItem('attendees');

    if (storedAttendees) {
      setValue('attendees', JSON.parse(storedAttendees));
      return;
    }

    // Generate attendee list based on ticket quantity
    const result = data.cartItem.flatMap((item) => {
      const addOns =
        item.cartAddOn?.flatMap((addOnItem) => Array(addOnItem.quantity).fill(addOnItem)) || [];

      return Array.from({ length: item.quantity }, (_, index) => ({
        ticket: item.ticketType,
        addOn: addOns[index] || null,
        ...defaultAttendee,
      }));
    });

    setValue('attendees', result);
    localStorage.setItem('attendees', JSON.stringify(result)); // Cache the data
  }, [data, setValue]);

  useEffect(() => {
    const subscription = watch((values) => {
      localStorage.setItem('attendees', JSON.stringify(values.attendees));
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    const handleScroll = () => {
      if (!ref.current) return;
      // checkOverflow();
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

  useEffect(() => {
    const parent = ref.current;
    if (!parent) return;

    const checkActiveSection = () => {
      let currentActiveId = null;

      fields.forEach((field) => {
        const el = document.getElementById(field.id);
        if (el) {
          const elRect = el.getBoundingClientRect();
          const parentRect = parent.getBoundingClientRect();

          if (elRect.top <= parentRect.top + 10) {
            currentActiveId = field.id;
          }
        }
      });

      setActiveFieldId(currentActiveId);
    };

    parent.addEventListener('scroll', checkActiveSection);
    checkActiveSection(); // Run once on mount

    // eslint-disable-next-line consistent-return
    return () => {
      parent.removeEventListener('scroll', checkActiveSection);
    };
  }, [fields]);

  useLayoutEffect(() => {
    if (!boxRef.current) return;
    const overviewBox = boxRef.current;

    const handleClick = (event) => {
      if (!overviewBox.contains(event.target)) {
        anotherCollapse.onFalse();
      }
    };

    document.addEventListener('click', handleClick);

    // eslint-disable-next-line consistent-return
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [anotherCollapse]);

  if (cartLoading) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 5,
          borderRadius: 3,
          bgcolor: 'background.paper',
        }}
      >
        <CircularProgress
          thickness={4}
          size={40}
          sx={{
            color: 'grey.800',
            mb: 3,
          }}
        />
        <Typography variant="h6" sx={{ mb: 1 }}>
          Loading Your Cart
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          We&apos;re retrieving your order information...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: 1,
        borderRadius: 3,
        overflow: 'hidden',
        p: { xs: 2, md: 3 },
        bgcolor: 'background.paper',
        boxShadow: '0 0 24px rgba(0,0,0,0.05)',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Iconify icon="solar:cart-3-bold" width={28} color="grey.800" />
        <ListItemText
          primary="Billing Information"
          secondary="Personal and contact information of the buyer."
          primaryTypographyProps={{ variant: 'h5', fontWeight: 600 }}
          secondaryTypographyProps={{ variant: 'body2', mt: 0.5 }}
        />
      </Stack>

      <Box
        ref={ref}
        flexGrow={1}
        sx={{
          px: { xs: 1, md: 2 },
          my: 2,
          height: 'calc(100vh - 30vh)',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'thin',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: (theme) => alpha(theme.palette.text.primary, 0.2),
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: (theme) => alpha(theme.palette.text.primary, 0.3),
          },
        }}
      >
        {isCartExpired && (
          <Card sx={{ mb: 3, p: 2, bgcolor: 'error.lighter', borderRadius: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Iconify icon="solar:clock-circle-bold" width={24} color="error.main" />
              <Typography color="error.main" fontWeight={500}>
                Your cart has expired
              </Typography>
            </Stack>
          </Card>
        )}

        {buyerInfo}

        <Divider sx={{ my: 3 }} />

        {attendeeinfo}

        <IconButton
          size="small"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: isOverflow.value ? 'flex' : 'none',
            bgcolor: 'grey.800',
            color: 'common.white',
            boxShadow: '0 8px 16px 0 rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
            '&.MuiIconButton-root': {
              '&:hover': {
                bgcolor: 'grey.900',
                transform: 'translateY(-2px)',
              },
            },
            zIndex: 999,
          }}
          onClick={scrollToTop}
        >
          <Iconify icon="raphael:arrowup" width={22} />
        </IconButton>
      </Box>

      {fields?.length && (
        <Stack sx={{ color: 'black', position: 'absolute', top: 100, left: -100 }}>
          {fields.map((field, index) => (
            <Typography
              key={index}
              variant="caption"
              color="text.secondary"
              sx={{
                cursor: 'pointer',
                ...(activeFieldId === field.id && {
                  position: 'relative',
                  left: 4,
                  color: 'grey.900',
                  fontWeight: 600,
                }),
                '&:hover': {
                  color: 'grey.800',
                },
              }}
              onClick={(e) => {
                const s = document.getElementById(field.id);

                if (s) {
                  s.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  setActiveFieldId(field.id);
                }
              }}
            >
              {field.isForbuyer ? "Buyer's Ticket" : `Attendee ${index + 1}`}
            </Typography>
          ))}
        </Stack>
      )}

      {mdDown && (
        <Box
          ref={boxRef}
          p={2.5}
          mt="auto"
          sx={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
            zIndex: 9,
          }}
        >
          <>
            <Collapse in={anotherCollapse.value} timeout="auto">
              <Box sx={{ maxHeight: '55vh', overflowY: 'auto', mb: 2.5 }} position="relative">
                <Typography variant="h6" sx={{ mb: 2, mt: 1 }}>
                  Order Summary
                </Typography>
                <Stack
                  sx={{
                    '& .MuiTypography-root': {
                      fontSize: 14,
                    },
                  }}
                  width={1}
                  spacing={2.5}
                  flexShrink={2}
                  flex={1}
                  justifyContent="space-between"
                >
                  <Card
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: (theme) => alpha(theme.palette.background.neutral, 0.6),
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack spacing={2}>
                      {data?.cartItem.map((item) => (
                        <Stack
                          key={item.id}
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Iconify icon="mdi:ticket-outline" width={16} />
                            <Typography
                              sx={{ fontWeight: 500 }}
                            >{`${item.quantity} × ${item.ticketType.title}`}</Typography>
                          </Stack>
                          <Typography sx={{ fontWeight: 600 }}>
                            {Intl.NumberFormat('en-MY', {
                              style: 'currency',
                              currency: 'MYR',
                            }).format(item.quantity * item.ticketType.price)}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Card>

                  <Stack spacing={2.5}>
                    {data && (
                      <Card
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Stack spacing={1.5}>
                          <Typography variant="subtitle2" mb={0.5}>
                            Discount Code
                          </Typography>
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            spacing={1}
                          >
                            <TextField
                              size="small"
                              fullWidth
                              placeholder="Enter Discount Code"
                              value={discountCode}
                              onChange={(e) =>
                                setDiscountCode(e.target.value.toUpperCase().split(' ').join(''))
                              }
                              InputProps={{
                                sx: { borderRadius: 1.5 },
                              }}
                            />
                            <Button
                              variant="contained"
                              size="medium"
                              onClick={handleRedeemDiscount}
                              sx={{
                                height: 40,
                                borderRadius: 1.5,
                                px: 2,
                                bgcolor: 'grey.800',
                                '&:hover': {
                                  bgcolor: 'grey.900',
                                },
                              }}
                            >
                              Apply
                            </Button>
                          </Stack>

                          {!!data.discount && (
                            <Stack spacing={1} sx={{ mt: 1 }}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Iconify
                                  icon="lets-icons:check-fill"
                                  color="success.main"
                                  width={16}
                                />
                                <Typography variant="body2" color="success.main" fontWeight={500}>
                                  Discount code applied
                                </Typography>
                              </Stack>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                sx={{
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  bgcolor: (theme) => alpha(theme.palette.success.lighter, 0.5),
                                }}
                              >
                                <Typography variant="body2" fontWeight={500}>
                                  {data.discount.code}
                                </Typography>
                                <Typography variant="body2" color="error" fontWeight={500}>
                                  - {data.discount.value}
                                </Typography>
                              </Stack>
                            </Stack>
                          )}
                        </Stack>
                      </Card>
                    )}

                    <Card
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Stack spacing={2}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography color="text.secondary">Subtotal:</Typography>
                          <Typography fontWeight={500}>
                            {Intl.NumberFormat('en-MY', {
                              style: 'currency',
                              currency: 'MYR',
                            }).format(subTotal)}
                          </Typography>
                        </Stack>

                        {data && (
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography color="text.secondary">Discount:</Typography>
                            <Typography fontWeight={500} color="error.main">
                              -{' '}
                              {Intl.NumberFormat('en-MY', {
                                style: 'currency',
                                currency: 'MYR',
                              }).format(data?.orderSummary?.discount)}
                            </Typography>
                          </Stack>
                        )}

                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography color="text.secondary">SST:</Typography>
                          <Typography fontWeight={500}>
                            {Intl.NumberFormat('en-MY', {
                              style: 'currency',
                              currency: 'MYR',
                            }).format(0.1)}
                          </Typography>
                        </Stack>

                        <Divider />

                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography variant="subtitle1">Total:</Typography>
                          <Typography variant="h6" color="grey.800">
                            {Intl.NumberFormat('en-MY', {
                              style: 'currency',
                              currency: 'MYR',
                            }).format(
                              data?.orderSummary?.totalPrice
                                ? data.orderSummary.totalPrice + 0.1
                                : subTotal + 0.1
                            )}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Card>
                  </Stack>
                </Stack>
              </Box>
            </Collapse>

            <Box
              onClick={() => anotherCollapse.onToggle()}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                mb: 2,
                p: 1.5,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.grey[200], 0.5),
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.grey[300], 0.5),
                },
              }}
            >
              <Typography variant="subtitle1">
                {anotherCollapse.value ? 'Hide Order Summary' : 'View Order Summary'}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography variant="subtitle1" fontWeight={600} color="grey.800">
                  {Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(
                    data?.orderSummary?.totalPrice ? data.orderSummary.totalPrice + 0.1 : 0
                  )}
                </Typography>
                <Iconify
                  icon={
                    anotherCollapse.value
                      ? 'iconamoon:arrow-up-2-bold'
                      : 'iconamoon:arrow-down-2-bold'
                  }
                  width={20}
                  sx={{
                    transition: 'transform 0.2s ease',
                    transform: anotherCollapse.value ? 'rotate(0deg)' : 'rotate(0deg)',
                  }}
                />
              </Stack>
            </Box>

            <LoadingButton
              size="large"
              variant="contained"
              fullWidth
              type="submit"
              // loading={loading.value}
              // onClick={handleCheckout}
              // disabled={!totalTicketsQuantitySelected}
              startIcon={
                <Iconify icon="material-symbols-light:shopping-cart-checkout-rounded" width={22} />
              }
              sx={{
                borderRadius: 2,
                py: 1.5,
                bgcolor: 'grey.800',
                '&:hover': {
                  bgcolor: 'grey.900',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s',
              }}
            >
              Proceed to Payment
            </LoadingButton>
          </>
        </Box>
      )}
    </Box>
  );
};

export default TicketInformationCard;
