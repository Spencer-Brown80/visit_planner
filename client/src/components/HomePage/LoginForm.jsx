import React, { useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Box, Button, FormControl, FormLabel, Input, VStack, Text, Center } from "@chakra-ui/react";
import { UserContext } from "/src/UserContext";
import { useNavigate } from "react-router-dom";

const LoginForm = ({ onShowRegister }) => {
  const { setIsLogin, setUserId } = useContext(UserContext);
  const navigate = useNavigate();

  const initialValues = {
    username: "",
    password: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string().required("Required"),
    password: Yup.string().required("Required"),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Invalid username or password");
        }
        return response.json();
      })
      .then((user_data) => {
        setSubmitting(false);
        setIsLogin(true);
        setUserId(user_data.id);  // Set userId in context
        navigate(`/usermenu/${user_data.id}/agenda`);
      })
      .catch((error) => {
        console.error("Error:", error);
        setSubmitting(false);
      });
  };

  return (
    <Center height="100vh">
      <Box width="100%" maxW="400px" p={4} boxShadow="lg" borderRadius="md" mt={20}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Username</FormLabel>
                  <Field name="username" as={Input} />
                  <ErrorMessage name="username" component="div" className="error" />
                </FormControl>

                <FormControl>
                  <FormLabel>Password</FormLabel>
                  <Field name="password" type="password" as={Input} />
                  <ErrorMessage name="password" component="div" className="error" />
                </FormControl>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Log In"}
                </Button>

                <Text>
                  Not registered?{" "}
                  <Text as="span" color="blue.500" cursor="pointer" onClick={onShowRegister}>
                    Register here
                  </Text>
                </Text>
              </VStack>
            </Form>
          )}
        </Formik>
      </Box>
    </Center>
  );
};

export default LoginForm;
