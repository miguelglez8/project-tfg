package com.example.trabajosacademicos.services.impl;

import com.example.trabajosacademicos.entities.*;
import com.example.trabajosacademicos.exception.NotificationNotFoundException;
import com.example.trabajosacademicos.exception.UserNotFoundException;
import com.example.trabajosacademicos.mappers.NotificationMapper;
import com.example.trabajosacademicos.repositories.JobUserRelationRepository;
import com.example.trabajosacademicos.repositories.NotificationRepository;
import com.example.trabajosacademicos.repositories.UserRepository;
import com.example.trabajosacademicos.dtos.NotificationDTO;
import com.example.trabajosacademicos.services.NotificationService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final JobUserRelationRepository jobUserRelationRepository;

    @Override
    public void markRead(Long notificationId) {
        Optional<Notification> notification = notificationRepository.findById(notificationId);
        if (notification.isEmpty()) throw new NotificationNotFoundException("Notification not exist");
        else {
            notification.get().setSeen(!notification.get().isSeen());

            notificationRepository.save(notification.get());
        }
    }

    @Override
    public void markHidden(Long notificationId) {
        Optional<Notification> notification = notificationRepository.findById(notificationId);
        if (notification.isEmpty()) throw new NotificationNotFoundException("Notification not exist");
        else {
            notification.get().setHidden(!notification.get().isHidden());

            notificationRepository.save(notification.get());
        }
    }

    @Override
    public List<NotificationDTO> getHiddenNotifications(String receiver) {
        User user = userRepository.findByEmail(receiver);
        if (user == null) throw new UserNotFoundException("User notification not found");
        return user.getNotifications().stream().
                filter(element -> element.isHidden()).
                map(element -> NotificationMapper.mapToNotificationDTO(element)).
                sorted(Comparator.comparing(NotificationDTO::getDate).reversed()).
                collect(Collectors.toList());
    }

    @Override
    public List<NotificationDTO> getNotHiddenNotifications(String receiver) {
        User user = userRepository.findByEmail(receiver);
        if (user == null) throw new UserNotFoundException("User notification not found");
        return user.getNotifications().stream().
                filter(element -> !element.isHidden()).
                map(element -> NotificationMapper.mapToNotificationDTO(element)).
                sorted(Comparator.comparing(NotificationDTO::getDate).reversed()).
                collect(Collectors.toList());
    }

    @Override
    public List<NotificationDTO> getNotSeenNotifications(String receiver) {
        User user = userRepository.findByEmail(receiver);
        if (user == null) throw new UserNotFoundException("User notification not found");
        return user.getNotifications().stream().
                filter(element -> !element.isSeen() && !element.isHidden()).
                map(element -> NotificationMapper.mapToNotificationDTO(element)).
                collect(Collectors.toList());
    }

    @Override
    public void deleteByUser(String email) {
        User user = userRepository.findByEmail(email);
        List<Notification> notifications = user.getNotifications();

        notificationRepository.deleteAll(notifications);
    }

    @Override
    public void push(NotificationDTO notification) {
        if (notification.getType() != null && (
            notification.getType().equals("INQUIRIES") ||
            notification.getType().equals("JOB_LEAVE") ||
            notification.getType().equals("JOB_DELETE") ||
            notification.getType().equals("CONVERSATION_JOB") ||
            notification.getType().equals("JOB_NOTE")
        )) {
            List<JobUserRelation> jobs;

            if (notification.getType().equals("JOB_DELETE")) {
                jobs = jobUserRelationRepository.findByJob(notification.getReceiver()).stream()
                        .skip(1).collect(Collectors.toList());
            } else if (notification.getType().equals("INQUIRIES")) {
                jobs = jobUserRelationRepository.findByJob(notification.getReceiver()).stream().
                        filter(elem -> elem.getRole().equals(JobRole.ADMIN)).
                        collect(Collectors.toList());
            } else {
                jobs = jobUserRelationRepository.findByJob(notification.getReceiver()).stream().
                        filter(elem -> !elem.getUser().getEmail().equals(notification.getSender())).
                        collect(Collectors.toList());
            }

            jobs.forEach(job -> {
                User admin = job.getUser();

                saveNotification(notification, admin, notification.getReceiver());
            });

            return;
        } else if (notification.getType() != null && (
                  notification.getType().equals("JOB_EXIT")
        )) {
            List<JobUserRelation> jobs = jobUserRelationRepository.findByUser(notification.getSender());

            jobs.forEach(job -> {
                Job jobToSend = job.getJob();

                List<JobUserRelation> jobUserRelation = jobToSend.getJobUserRelations().stream().filter(
                        element -> element.getUser().getEmail().equals(notification.getSender()) == false).
                        collect(Collectors.toList());

                jobUserRelation.forEach(relation -> {
                    User user = relation.getUser();

                    saveNotification(notification, user, relation.getJob().getTitle());
                });
            });

            return;
        }

        User user = userRepository.findByEmail(notification.getReceiver());

        if (user != null) {
            saveNotification(notification, user, notification.getTitleTeam());
        } else {
            throw new UserNotFoundException("User not found");
        }
    }

    @Override
    public void deleteBySenderAndReceiver(String sender, String receiver) {
        User user = userRepository.findByEmail(receiver);
        User user2 = userRepository.findByEmail(sender);
        if (user == null || user2 == null) throw new UserNotFoundException("Sender or receiver not found");

        List<Notification> notifications = user.getNotifications();
        List<Notification> filtered = notifications.stream().filter(
                    elem -> {
                        if (elem.getSender() != null) {
                            return elem.getSender().equals(sender) && elem.getType().toString().equals("FRIENDSHIP");
                        }
                        return false;
                    })
                .collect(Collectors.toList());

        if (filtered.isEmpty() == false) {
            user.getNotifications().removeAll(filtered);

            notificationRepository.deleteAll(filtered);
            userRepository.save(user);
        }
    }

    @Override
    public void deleteBySenderAndTitle(String sender, String title) {
        User user = userRepository.findByEmail(sender);
        if (user == null) throw new UserNotFoundException("Sender not found");

        List<Notification> notifications = notificationRepository.findBySender(sender);
        List<Notification> filtered = notifications.stream().filter(
                        elem -> elem.getTitleTeam() != null && elem.getTitleTeam().equals(title) && elem.getType().toString().equals("INQUIRIES"))
                .collect(Collectors.toList());

        if (filtered.isEmpty() == false) {
            user.getNotifications().removeAll(filtered);

            notificationRepository.deleteAll(filtered);
            userRepository.save(user);
        }
    }

    private void saveNotification(NotificationDTO notification, User admin, String titleTeam) {
        Notification createdNotification = Notification.builder()
                .type(notification.getType())
                .userNotif(admin)
                .sender(notification.getSender())
                .seen(false)
                .hidden(false)
                .date(notification.getDate().plusHours(2))
                .titleTeam(titleTeam)
                .build();

        if (admin.getNotifications() == null) admin.setNotifications(new ArrayList<>());
        admin.getNotifications().add(0, createdNotification);

        notificationRepository.save(createdNotification);
        userRepository.save(admin);
    }
}
