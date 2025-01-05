package com.example.trabajosacademicos.services.impl;

import com.example.trabajosacademicos.dtos.EventDTO;
import com.example.trabajosacademicos.dtos.TaskDTO;
import com.example.trabajosacademicos.dtos.UserDTO;
import com.example.trabajosacademicos.responses.ControlResponse;
import com.example.trabajosacademicos.responses.ParticipationResponse;
import com.example.trabajosacademicos.services.InformService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Service
@AllArgsConstructor
public class InformServiceImpl implements InformService {

    @Override
    public List<ParticipationResponse> getParticipation(List<TaskDTO> tasks, List<EventDTO> events, List<UserDTO> jobUserRelations) {
        List<ParticipationResponse> informList = new ArrayList<>();

        Map<String, Integer> totalItemsByMember = new HashMap<>();

        for (TaskDTO task : tasks) {
            for (String user : task.getAssignedTo()) {
                totalItemsByMember.put(user, totalItemsByMember.getOrDefault(user, 0) + 1);
            }
        }

        for (EventDTO event : events) {
            for (String user : event.getAssignedTo()) {
                totalItemsByMember.put(user, totalItemsByMember.getOrDefault(user, 0) + 1);
            }
        }

        for (UserDTO member : jobUserRelations) {
            int memberTotalItems = totalItemsByMember.getOrDefault(member.getEmail(), 0);

            ParticipationResponse response = new ParticipationResponse(member.getFirstName() + " " + member.getLastName(), memberTotalItems);

            informList.add(response);
        }

        return informList;
    }

    @Override
    public List<ControlResponse> getWeeklyControl(List<TaskDTO> tasks, List<EventDTO> events) {
        LocalDate today = LocalDate.now();

        List<ControlResponse> controlResponses = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            controlResponses.add(new ControlResponse(0, 0, 0));
        }

        for (TaskDTO task : tasks) {
            LocalDate deadline = task.getDeadlineDateTime().toLocalDate();
            int index = calculateDayIndex(today, deadline);
            if (index != -1 && index < controlResponses.size()) {
                ControlResponse controlResponse = controlResponses.get(index);
                controlResponse.setTasks(controlResponse.getTasks() + 1);
                if (task.getPercentage() == 100) {
                    controlResponse.setCompletedTasks(controlResponse.getCompletedTasks() + 1);
                }
            }
        }

        for (EventDTO event : events) {
            LocalDate start = event.getDeadlineDateTimeInit().toLocalDate();
            int index = calculateDayIndex(today, start);
            if (index != -1 && index < controlResponses.size()) {
                ControlResponse controlResponse = controlResponses.get(index);
                controlResponse.setEvents(controlResponse.getEvents() + 1);
            }
        }

        return controlResponses;
    }

    @Override
    public List<ControlResponse> getMonthlyControl(List<TaskDTO> tasks, List<EventDTO> events) {
        List<ControlResponse> monthlyControlResponses = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            monthlyControlResponses.add(new ControlResponse(0, 0, 0));
        }

        int currentMonthIndex = YearMonth.now().getMonthValue() - 1;

        for (TaskDTO task : tasks) {
            LocalDate deadlineDate = task.getDeadlineDateTime().toLocalDate();
            int taskMonthIndex = deadlineDate.getMonthValue() - 1;
            int monthIndex = getMonthIndex(currentMonthIndex, taskMonthIndex);
            if (monthIndex != -1) {
                ControlResponse controlResponse = monthlyControlResponses.get(monthIndex);
                controlResponse.setTasks(controlResponse.getTasks() + 1);
                if (task.getPercentage() == 100) {
                    controlResponse.setCompletedTasks(controlResponse.getCompletedTasks() + 1);
                }
            }
        }

        for (EventDTO event : events) {
            LocalDate startDate = event.getDeadlineDateTimeInit().toLocalDate();
            int eventMonthIndex = startDate.getMonthValue() - 1;
            int monthIndex = getMonthIndex(currentMonthIndex, eventMonthIndex);
            if (monthIndex != -1) {
                ControlResponse controlResponse = monthlyControlResponses.get(monthIndex);
                controlResponse.setEvents(controlResponse.getEvents() + 1);
            }
        }

        return monthlyControlResponses;
    }


    private int calculateDayIndex(LocalDate today, LocalDate date) {
        int index = -1;
        int daysDifference = (int) (date.toEpochDay() - today.toEpochDay());
        switch (daysDifference) {
            case 0:
                index = 1;
                break;
            case -1:
                index = 0;
                break;
            case 1:
                index = 2;
                break;
            case 2:
                index = 3;
                break;
            default:
                if (daysDifference > 2 && daysDifference < 7) {
                    index = daysDifference + 1;
                }
        }
        return index;
    }

    private int getMonthIndex(int currentMonthIndex, int taskMonthIndex) {
        int difference = taskMonthIndex - currentMonthIndex;
        if (difference >= -2 && difference <= 3) {
            return difference + 2;
        } else {
            return -1;
        }
    }

}