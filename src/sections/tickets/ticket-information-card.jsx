import useSWR from 'swr';
import dayjs from 'dayjs';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, useFieldArray } from 'react-hook-form';
import React, { useRef, useMemo, useState, useEffect } from 'react';

import {
  Box,
  Stack,
  alpha,
  Divider,
  MenuItem,
  Collapse,
  Typography,
  IconButton,
  ListItemText,
  CircularProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { fetcher } from 'src/utils/axios';

import Image from 'src/components/image';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import FormProvider, { RHFSelect, RHFCheckbox } from 'src/components/hook-form';

import { TextFieldCustom } from './components/text-field';

const schema = yup.object().shape({
  buyer: yup.object().shape({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Must be a valid email').required('Email is required'),
    phoneNumber: yup.string().required('Phone number is required'),
    company: yup.string().required('Company name is required'),
    isAnAttendee: yup.boolean(),
    ticket: yup.string().when('isAnAttendee', {
      is: (y) => y.val,
      then: (y) => y.string().required('Ticket type is required'),
    }),
  }),
  attendees: yup.array().of(
    yup.object().shape({
      firstName: yup.string().required('First name is required'),
      lastName: yup.string().required('Last name is required'),
      email: yup.string().required('Email is required'),
      phoneNumber: yup.string().required('Phone number is required'),
      company: yup.string().required('Company name is required'),
    })
  ),
});

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
  const [collapseAttendees, setCollapseAttendees] = useState([]);
  const ref = useRef();

  const isOverflow = useBoolean();
  const [activeFieldId, setActiveFieldId] = useState(null);

  const [lastRemoved, setLastRemoved] = useState(null);

  const { data, isLoading: cartLoading } = useSWR('/api/cart/', fetcher);

  const isCartExpired = useMemo(() => dayjs(data.expiryDate).isBefore(dayjs(), 'date'), [data]);

  const ticketTypes = useMemo(() => data?.cartItem, [data]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      buyer: {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        company: '',
        isAnAttendee: false,
        ticket: '',
      },
      attendees: null,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const { watch, control, setValue, getValues } = methods;

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
        update(existingTagIndex, { ...defaultAttendee, ticket: existingValue.ticket });
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
          ? { ...defaultAttendee, ticket: item.ticket }
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

    setValue(name, value, { shouldValidate: true });
  };

  const copyCompanyName = () => {};

  const helperText = (
    <Stack spacing={0.5} color="text.secondary" my={2}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Iconify icon="material-symbols:mail-outline" width={24} />
        <Typography variant="caption">
          Your ticket(s) will be sent to your provided email address.
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Iconify icon="ic:baseline-whatsapp" width={24} />
        <Typography variant="caption">
          Information regarding the event will be sent to your WhatsApp.
        </Typography>
      </Stack>
    </Stack>
  );

  const buyerInfo = (
    <Stack spacing={1}>
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
          p: 1.5,
          borderRadius: 2,
          transition: 'all .1s',
          transitionTimingFunction: 'linear',
          '&:hover': {
            bgcolor: (theme) => theme.palette.divider,
          },
        }}
      >
        <Typography variant="subtitle1">Buyer&apos;s information</Typography>
        <IconButton>
          {collapse.value ? (
            <Iconify icon="ep:arrow-down-bold" width={20} />
          ) : (
            <Iconify icon="ep:arrow-right-bold" width={20} />
          )}
        </IconButton>
      </Stack>

      <Collapse in={collapse.value} timeout="auto" unmountOnExit>
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
          <TextFieldCustom name="buyer.lastName" label="Last Name" onChange={onChangeInputBuyer} />
          <TextFieldCustom name="buyer.email" label="Email" onChange={onChangeInputBuyer} />
          <TextFieldCustom
            name="buyer.phoneNumber"
            label="Phone Number"
            inputMode="decimal"
            onChange={onChangeInputBuyer}
          />
          <TextFieldCustom name="buyer.company" label="Company" onChange={onChangeInputBuyer} />
          {buyer && (
            <RHFSelect
              name="buyer.ticket"
              label="For which ticket?"
              onChange={(e) => handleChangeTicket(e.target.value)}
              sx={{
                '& .MuiInputBase-root': {
                  '& fieldset': {
                    borderColor: '#DFDFDF', // Change the border color here
                  },
                  borderRadius: 0.5,
                },
                '& .MuiInputLabel-root': {
                  color: '#707070',
                },
              }}
            >
              <MenuItem disabled value="">
                <em>Select an option</em>
              </MenuItem>
              {ticketTypes?.map((ticket) => (
                <MenuItem key={ticket.id} value={ticket.ticketType.id}>
                  {ticket.ticketType.title}
                </MenuItem>
              ))}
            </RHFSelect>
          )}
        </Box>

        {helperText}

        <RHFCheckbox
          name="buyer.isAnAttendee"
          label="I am also an attendee"
          onChange={(_, val) => handleBuyerCheckbox(val)}
          sx={{
            '&.Mui-checked': {
              color: 'black',
            },
          }}
        />
      </Collapse>
    </Stack>
  );

  const attendeeinfo = (
    <Stack spacing={1}>
      <Typography variant="subtitle1">Attendee&apos;s information</Typography>

      <Stack spacing={2}>
        {fields.map((field, index) => (
          <Box key={field.id}>
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
              mb={1}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse(index);
              }}
              sx={{
                cursor: 'pointer',
                p: 1.5,
                borderRadius: 2,
                transition: 'all .1s',
                transitionTimingFunction: 'linear',
                '&:hover': {
                  bgcolor: (theme) => theme.palette.divider,
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  Attendee {index + 1}
                </Typography>
                <Stack direction="row" alignItems="center" flexWrap="wrap" spacing={1}>
                  <Label color="info">
                    <Iconify icon="mingcute:ticket-line" width={20} mr={1} />
                    {field.ticket.title}
                  </Label>
                  {field.isForbuyer && <Label color="success">Buyer&apos;s ticket</Label>}
                </Stack>
              </Stack>

              <IconButton>
                {collapseAttendees.includes(index) ? (
                  <Iconify icon="ep:arrow-down-bold" width={20} />
                ) : (
                  <Iconify icon="ep:arrow-right-bold" width={20} />
                )}
              </IconButton>
            </Stack>

            <Collapse in={collapseAttendees.includes(index)} timeout="auto" unmountOnExit>
              <Box
                display="grid"
                gridTemplateColumns={{ xs: 'repeat(1,1fr)', md: 'repeat(2,1fr)' }}
                gap={2}
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
            </Collapse>

            {index < fields.length - 1 && (
              <Divider
                sx={{
                  mt: 3,
                  mb: 2,
                }}
              />
            )}
          </Box>
        ))}
      </Stack>
    </Stack>
  );

  const scrollToTop = () => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = 0;
  };

  useEffect(() => {
    if (!data?.cartItem?.length) return;

    const result = data.cartItem.flatMap((item) =>
      Array.from({ length: item.quantity }, () => ({
        ticket: item.ticketType,
        ...defaultAttendee,
        isCollapse: true,
      }))
    );

    setValue('attendees', result);
  }, [data, setValue]);

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

  // useEffect(() => {
  //   if (!data) return;
  //   window.onbeforeunload = () =>
  //     'Any string value here forces a dialog box to \n appear before closing the window.';
  // }, [data]);

  if (cartLoading) {
    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
      <CircularProgress
        thickness={7}
        size={25}
        sx={{
          color: (theme) => theme.palette.common.black,
          strokeLinecap: 'round',
        }}
      />
    </Box>;
  }

  return (
    <Stack
      sx={{
        height: 1,
        borderRadius: 2,
        overflow: 'hidden',
        color: 'whitesmoke',
        bgcolor: 'white',
      }}
    >
      <Box sx={{ bgcolor: 'black', p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Image src="/assets/tickets/ticket-2.svg" width={20} />
          <ListItemText
            primary="Billing Information"
            secondary="Personal and contact information of the buyer."
            primaryTypographyProps={{ variant: 'subtitle1' }}
            secondaryTypographyProps={{ color: 'white', variant: 'caption' }}
          />
        </Stack>
      </Box>
      <Box
        ref={ref}
        flexGrow={1}
        sx={{
          px: 2,
          my: 2,
          height: 'calc(100vh - 30vh)',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'thin',
          scrollBehavior: 'smooth',
          color: 'black',
        }}
      >
        {isCartExpired && 'Expired already'}
        <FormProvider methods={methods}>
          {buyerInfo}
          <Divider sx={{ my: 2 }} />
          {attendeeinfo}
        </FormProvider>
        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            display: isOverflow.value && 'none',
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
                  color: 'black',
                  fontWeight: 600,
                }),
                '&:hover': {
                  color: alpha('#000000', 1),
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
    </Stack>
  );
};

export default TicketInformationCard;
