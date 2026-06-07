import { MealPlanRepository } from "../../domain/repositories/MealPlanRepository";
import { WEEK_DAYS } from "../../domain/value-objects/WeekDay";

export class SwapPlannedMealsUseCase {
  constructor(private mealPlanRepo: MealPlanRepository) {}

  async execute(planId: string, sourceMealId: string, targetMealId: string) {
    const plan = await this.mealPlanRepo.findById(planId);
    if (!plan) throw new Error("Meal plan not found");

    const sourceMeal = plan.days.find((meal) => meal.id === sourceMealId);
    const targetMeal = plan.days.find((meal) => meal.id === targetMealId);
    if (!sourceMeal || !targetMeal) throw new Error("Meal not found");
    if (sourceMeal.id === targetMeal.id) return plan;

    const updatedDays = plan.days
      .map((meal) => {
        if (meal.id === sourceMeal.id) return { ...meal, day: targetMeal.day };
        if (meal.id === targetMeal.id) return { ...meal, day: sourceMeal.day };
        return meal;
      })
      .sort((a, b) => WEEK_DAYS.indexOf(a.day) - WEEK_DAYS.indexOf(b.day));

    const updatedPlan = { ...plan, days: updatedDays };
    await this.mealPlanRepo.save(updatedPlan);
    return updatedPlan;
  }
}
