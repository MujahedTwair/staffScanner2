import express from "express";
const app = express();
import * as vacationController from './Controller/vacation.controller.js';
import validation from "../../middleware/validation.js";
import * as validationSchema from './vacation.validation.js'
import asyncHandler from "../../middleware/errorHandling.js";
import authCompany from "../../middleware/authCompany.js";
import authEmployee from "../../middleware/authEmployee.js";

app.post('/requestVacation', authEmployee, validation(validationSchema.requestVacationSchema), asyncHandler(vacationController.requestVacation));
app.get('/reviewVacations', authEmployee, validation(validationSchema.pageVacationSchema), asyncHandler(vacationController.reviewVacations));
app.delete('/deleteVacation/:id', authEmployee, validation(validationSchema.deleteVacationSchema), asyncHandler(vacationController.deleteVacation));
app.get('/vacationTypes', authEmployee, asyncHandler(vacationController.getVacationTypes));

app.get('/viewVacation', authCompany, validation(validationSchema.pageVacationSchema), asyncHandler(vacationController.viewVacation));
app.get('/viewArchiveVacation', authCompany, validation(validationSchema.pageVacationSchema), asyncHandler(vacationController.viewArchiveVacation));
app.patch('/approveVacation/:hashed_id', authCompany, validation(validationSchema.approveVacationSchema), asyncHandler(vacationController.approveVacation));

export default app;