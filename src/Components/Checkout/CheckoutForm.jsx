import React, { useContext, useEffect, useState } from 'react'
import { Button, Container, Grid, TextField, Typography } from '@mui/material'
import styles from './Chekout.module.css'
import { BsFillCartCheckFill } from 'react-icons/bs'
import { MdUpdate } from 'react-icons/md'
import axios from 'axios'
import { ContextFunction } from '../../Context/Context'
import profileImg from '../../Assets/Banner/vecteezy_user-avatar-line-style_.jpg'
import { Link, useNavigate } from 'react-router-dom'

const CheckoutForm = () => {
    const { cart } = useContext(ContextFunction)
    const [userData, setUserData] = useState([])

    let authToken = localStorage.getItem('Authorization')
    let setProceed = authToken ? true : false
    let navigate = useNavigate()
    let totalAmount = localStorage.getItem('totalAmount')

    useEffect(() => {
        if (setProceed) {
            getUserData()
        }
        else {
            navigate('/')
        }
    }, [])

    const [userDetails, setUserDetails] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        userEmail: '',
        address: '',
        zipCode: '',
        city: '',
        userState: '',

    })
    const getUserData = async () => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_GET_USER_DETAILS}`, {
                headers: {
                    'Authorization': authToken
                }
            })

            setUserData(data);
            userDetails.firstName = data.firstName
            userDetails.lastName = data.lastName
            userDetails.userEmail = data.email
            userDetails.phoneNumber = data.phoneNumber
            userDetails.address = data.address
            userDetails.zipCode = data.zipCode
            userDetails.city = data.city
            userDetails.userState = data.userState
        } catch (error) {
            console.log(error);
        }

    }

    const checkOutHandler = async (e) => {
        e.preventDefault()
        let zipRegex = /^[1-9]{1}[0-9]{2}\\s{0, 1}[0-9]{3}$/;

        const { data: { key } } = await axios.get(`${process.env.REACT_APP_GET_KEY}`)
        const { data } = await axios.post(`${process.env.REACT_APP_GET_CHECKOUT}`, {
            amount: totalAmount,
            productDetails: JSON.stringify(cart),
            userId: userData._id,
            userDetails: JSON.stringify(userDetails),
            email: userDetails.userEmail

        })

        const options = {
            key: key,
            amount: totalAmount,
            currency: "INR",
            name: userData.firstName + ' ' + userData.lastName,
            description: "Payment",
            image: profileImg,
            order_id: data.order.id,
            callback_url: process.env.REACT_APP_GET_PAYMENTVERIFICATION,
            prefill: {
                name: userData.firstName + ' ' + userData.lastName,
                email: userData.email,
                contact: userData.phoneNumber
            },
            notes: {
                "address": `${userData.address} ${userData.city} ${userData.zipCode} ${userData.userState}`
            },
            theme: {
                "color": "#1976d2"
            },

        };
        const razor = new window.Razorpay(options);
        razor.open();
    }

    const handleOnchange = (e) => {
        setUserDetails({ ...userDetails, [e.target.name]: e.target.value })
    }

    console.log(userDetails);
    return (
        <Container sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', marginBottom: 10 }}>
            <Typography variant='h6' sx={{ margin: '20px 0' }}>Checkout</Typography>
            <form noValidate autoComplete="off" className={styles.checkout_form} onSubmit={checkOutHandler} >
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField inputProps={{ readOnly: true }} label="First Name" name='firstName' value={userDetails.firstName || ''} onChange={handleOnchange} variant="outlined" fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField inputProps={{ readOnly: true }} label="Last Name" name='lastName' value={userDetails.lastName || ''} onChange={handleOnchange} variant="outlined" fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField inputProps={{ readOnly: true }} label="Contact Number" type='tel' name='phoneNumber' value={userDetails.phoneNumber || ''} onChange={handleOnchange} variant="outlined" fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField inputProps={{ readOnly: true }} label="Email" name='userEmail' value={userDetails.userEmail || ''} onChange={handleOnchange} variant="outlined" fullWidth />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField label="Address" name='address' value={userDetails.address || ''} onChange={handleOnchange} variant="outlined" fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField label="City" name='city' value={userDetails.city || ''} onChange={handleOnchange} variant="outlined" fullWidth />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField type='tel' label="Postal/Zip Code" name='zipCode' value={userDetails.zipCode || ''} onChange={handleOnchange} variant="outlined" fullWidth />
                    </Grid>
                    <Grid item xs={12} >
                        <TextField label="Province/State" name='userState' value={userDetails.userState || ''} onChange={handleOnchange} variant="outlined" fullWidth />
                    </Grid>
                </Grid>
                <Container sx={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 5 }}>
                    <Button variant='contained' endIcon={<BsFillCartCheckFill />} type='submit'>Checkout</Button>
                    <Link to='/update'> <Button variant='contained' endIcon={<MdUpdate />}>Update</Button></Link>
                </Container>
            </form >

        </Container >
    )
}

export default CheckoutForm