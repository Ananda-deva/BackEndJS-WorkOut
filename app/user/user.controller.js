import asyncHandler from 'express-async-handler'

import { prisma } from '../prisma.js'
import { UserFields } from '../utils/user.utils.js'

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
	const user = await prisma.user.findUnique({
		where: {
			id: req.user.id
		},
		select: UserFields
	})

	const countExerciseTimeCompleted = await prisma.exerciseLog.count({
		where: {
			userId: req.user.id,
			isCompleted: true
		}
	})

	const kg = await prisma.exerciseTime.aggregate({
		where: {
			exerciseLog: {
				userId: req.user.id
			},
			isCompleted: true
		},
		_sum: {
			weight: true
		}
	})

	const workouts = await prisma.workoutLog.count({
		where: {
			userId: user.id,
			isCompleted: true
		}
	})

	res.json([
		{
			label: 'Minutes',
			value: Math.ceil(countExerciseTimeCompleted * 2.3)
		},
		{
			label: 'Workouts',
			value: workouts
		},
		{
			label: 'KGS',
			value: kg._sum.weight || 0
		}
	])
})
